import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError, ValidationError } from '../common/errors/AppError';
import { Prisma } from '@prisma/client';
import { auditService } from '../common/utils/audit';
import { publishBillingEvent } from '../../events/producers/billingEvents';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  ordered: ['delivered', 'active', 'decommissioned'],
  delivered: ['active', 'decommissioned'],
  active: ['maintenance', 'under_repair', 'damaged', 'lost_stolen', 'decommissioned'],
  maintenance: ['active', 'decommissioned'],
  under_repair: ['active', 'decommissioned'],
  damaged: ['under_repair', 'decommissioned'],
  lost_stolen: ['active', 'decommissioned'],
  decommissioned: [],
};

const TRANSFER_ALLOWED_STATUSES = ['active', 'maintenance'];

const TRANSITIONS_REQUIRING_REASON: Record<string, string[]> = {
  ordered: ['decommissioned'],
  delivered: ['decommissioned'],
  active: ['under_repair', 'damaged', 'lost_stolen', 'decommissioned'],
  maintenance: ['decommissioned'],
  under_repair: ['decommissioned'],
  damaged: ['under_repair', 'decommissioned'],
  lost_stolen: ['active', 'decommissioned'],
};

const LOST_STOLEN_RECOVERY_MIN_REASON = 20;

export class EquipmentInventoryService {
  async list(tenantId: string, filters?: { gymId?: string; catalogueItemId?: string; status?: string; includeInactive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId, deletedAt: null };
    if (filters?.gymId) where.gymId = filters.gymId;
    if (filters?.catalogueItemId) where.catalogueItemId = filters.catalogueItemId;
    if (filters?.status) where.status = filters.status;
    if (filters?.includeInactive) { delete where.isActive; delete where.deletedAt; }
    else where.isActive = true;
    return prisma.equipmentInventory.findMany({
      where,
      include: { catalogueItem: { select: { name: true, brand: true, model: true } }, gym: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const item = await prisma.equipmentInventory.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { catalogueItem: { select: { name: true, brand: true, model: true, warrantyMonths: true } }, gym: { select: { name: true } } },
    });
    if (!item) throw new NotFoundError('Equipment inventory item not found');
    return item;
  }

  async create(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const purchaseDate = new Date(input.purchaseDate);

    const catalogue = await prisma.equipmentCatalogue.findUnique({ where: { id: input.catalogueItemId } });
    if (!catalogue) throw new NotFoundError('Catalogue item not found');

    const warrantyStart = input.warrantyStartDate ? new Date(input.warrantyStartDate) : purchaseDate;
    const warrantyEnd = input.warrantyEndDate
      ? new Date(input.warrantyEndDate)
      : new Date(new Date(purchaseDate).setMonth(purchaseDate.getMonth() + (catalogue.warrantyMonths ?? 12)));

    const nextMaintenance = new Date(purchaseDate);
    nextMaintenance.setMonth(nextMaintenance.getMonth() + (input.maintenanceIntervalMonths ?? 6));

    let item;
    try {
      item = await prisma.equipmentInventory.create({
        data: {
          tenantId,
          catalogueItemId: input.catalogueItemId,
          serialNumber: input.serialNumber,
          gymId: input.gymId,
          location: input.location,
          purchaseDate,
          purchaseCost: input.purchaseCost,
          supplier: input.supplier,
          warrantyStartDate: warrantyStart,
          warrantyEndDate: warrantyEnd,
          maintenanceIntervalMonths: input.maintenanceIntervalMonths ?? 6,
          nextMaintenanceAt: nextMaintenance,
          status: input.status ?? 'ordered',
          notes: input.notes,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[])?.join(', ') || 'fields';
        throw new ConflictError(`An inventory item with this ${target} already exists for this tenant`);
      }
      throw err;
    }

    await this.logStatusChange(item.id, tenantId, null, item.status, userId, 'Item created');
    await publishBillingEvent('equipment.inventory.created', {
      inventoryId: item.id, catalogueItemId: item.catalogueItemId,
      catalogueName: catalogue.name, serialNumber: item.serialNumber,
      gymId: item.gymId, status: item.status,
      purchaseDate: item.purchaseDate.toISOString(),
      warrantyEndDate: item.warrantyEndDate?.toISOString() ?? null,
      nextMaintenanceAt: item.nextMaintenanceAt?.toISOString() ?? null,
    }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'equipment_inventory', entityId: item.id, description: `Created inventory item: ${catalogue.brand} ${catalogue.model} (${item.serialNumber})`, newValue: { serialNumber: item.serialNumber, catalogueItemId: item.catalogueItemId, gymId: item.gymId, status: item.status } });

    return this.getById(item.id, tenantId);
  }

  async update(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    const oldValues: Record<string, any> = {};
    const changedFields: string[] = [];

    if (input.gymId && input.gymId !== existing.gymId) {
      if (!TRANSFER_ALLOWED_STATUSES.includes(existing.status)) {
        throw new ValidationError(`Cannot transfer item in status '${existing.status}'. Only 'active' or 'maintenance' items can be transferred.`);
      }
      if (!input.reason || input.reason.length < 10) {
        throw new ValidationError('Reason is required (min 10 characters) for gym transfers');
      }
      oldValues.gymId = existing.gymId;
      changedFields.push('gymId');
    }

    if (input.status && input.status !== existing.status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(input.status)) {
        throw new ValidationError(`Cannot transition from '${existing.status}' to '${input.status}'`);
      }
      const needsReason = TRANSITIONS_REQUIRING_REASON[existing.status]?.includes(input.status);
      if (needsReason && (!input.reason || input.reason.length < 1)) {
        throw new ValidationError(`Reason is required for transition from '${existing.status}' to '${input.status}'`);
      }
      if (existing.status === 'lost_stolen' && input.status === 'active') {
        if (!input.reason || input.reason.length < LOST_STOLEN_RECOVERY_MIN_REASON) {
          throw new ValidationError(`Reason must be at least ${LOST_STOLEN_RECOVERY_MIN_REASON} characters for recovery from lost/stolen`);
        }
      }
      oldValues.status = existing.status;
      changedFields.push('status');
    }

    if (input.serialNumber && input.serialNumber !== existing.serialNumber) {
      oldValues.serialNumber = existing.serialNumber;
      changedFields.push('serialNumber');
    }

    let item;
    try {
      item = await prisma.equipmentInventory.update({
        where: { id },
        data: {
          catalogueItemId: input.catalogueItemId ?? existing.catalogueItemId,
          serialNumber: input.serialNumber ?? existing.serialNumber,
          gymId: input.gymId ?? existing.gymId,
          location: input.location !== undefined ? input.location : existing.location,
          purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : existing.purchaseDate,
          purchaseCost: input.purchaseCost !== undefined ? input.purchaseCost : existing.purchaseCost,
          supplier: input.supplier !== undefined ? input.supplier : existing.supplier,
          warrantyStartDate: input.warrantyStartDate ? new Date(input.warrantyStartDate) : existing.warrantyStartDate,
          warrantyEndDate: input.warrantyEndDate ? new Date(input.warrantyEndDate) : existing.warrantyEndDate,
          maintenanceIntervalMonths: input.maintenanceIntervalMonths ?? existing.maintenanceIntervalMonths,
          status: input.status ?? existing.status,
          notes: input.notes !== undefined ? input.notes : existing.notes,
        },
        include: { catalogueItem: { select: { name: true, brand: true, model: true } }, gym: { select: { name: true } } },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[])?.join(', ') || 'fields';
        throw new ConflictError(`An inventory item with this ${target} already exists for this tenant`);
      }
      throw err;
    }

    if (input.status && input.status !== existing.status) {
      await this.logStatusChange(id, tenantId, existing.status, input.status, userId, input.reason);
    }

    if (changedFields.includes('status')) {
      await publishBillingEvent('equipment.inventory.status.changed', {
        inventoryId: id, serialNumber: item.serialNumber,
        catalogueItemId: item.catalogueItemId,
        fromStatus: existing.status, toStatus: item.status,
        reason: input.reason || null,
      }, { tenantId, userId });
    } else {
      await publishBillingEvent('equipment.inventory.updated', {
        inventoryId: id, serialNumber: item.serialNumber,
        changedFields,
      }, { tenantId, userId });
    }

    await auditService.log({ tenantId, userId, action: changedFields.includes('status') ? 'STATUS_CHANGE' : 'UPDATE', entityType: 'equipment_inventory', entityId: id, description: changedFields.includes('status') ? `Status changed: ${existing.status} → ${item.status}` : `Updated inventory item: ${item.serialNumber}`, oldValue: oldValues, newValue: { serialNumber: item.serialNumber, status: item.status, gymId: item.gymId } });

    return item;
  }

  async restore(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const item = await prisma.equipmentInventory.findFirst({
      where: { id, tenantId, deletedAt: { not: null } },
    });
    if (!item) throw new NotFoundError('Deleted inventory item not found');
    const restored = await prisma.equipmentInventory.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
      include: { catalogueItem: { select: { name: true, brand: true, model: true } }, gym: { select: { name: true } } },
    });
    await publishBillingEvent('equipment.inventory.restored', {
      inventoryId: id, serialNumber: restored.serialNumber,
      catalogueItemId: restored.catalogueItemId,
      previousStatus: item.status, restoredStatus: restored.status,
    }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'RESTORE', entityType: 'equipment_inventory', entityId: id, description: `Restored inventory item: ${restored.serialNumber}` });
    return restored;
  }

  async delete(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    await prisma.equipmentInventory.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    await publishBillingEvent('equipment.inventory.deactivated', {
      inventoryId: id, serialNumber: existing.serialNumber,
      catalogueItemId: existing.catalogueItemId,
      statusBeforeDeactivation: existing.status, reason: 'soft-delete',
    }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'DELETE', entityType: 'equipment_inventory', entityId: id, description: `Soft-deleted inventory item: ${existing.serialNumber}`, oldValue: { serialNumber: existing.serialNumber, status: existing.status } });
  }

  private async logStatusChange(inventoryId: string, tenantId: string, fromStatus: string | null, toStatus: string, changedBy: string, reason?: string) {
    const prisma = getPrisma();
    await prisma.inventoryStatusLog.create({
      data: { tenantId, inventoryId, fromStatus, toStatus, changedBy, reason },
    });
  }
}

export const equipmentInventoryService = new EquipmentInventoryService();
