import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ValidationError, ConflictError } from '../common/errors/AppError';
import { Prisma } from '@prisma/client';
import { auditService } from '../common/utils/audit';
import { publishBillingEvent } from '../../events/producers/billingEvents';

const AUTO_APPROVAL_LIMIT = 10000;
const COST_OVERRUN_THRESHOLD = 1.20;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  scheduled: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled', 'failed'],
  completed: [],
  cancelled: [],
  failed: ['scheduled'],
};

const TRANSITIONS_REQUIRING_REASON: Record<string, string[]> = {
  scheduled: ['cancelled'],
  in_progress: ['cancelled', 'failed'],
  failed: ['scheduled'],
};

export class EquipmentMaintenanceService {
  async list(tenantId: string, filters?: {
    status?: string; inventoryId?: string; assignedTo?: string;
    type?: string; scheduledDateFrom?: string; scheduledDateTo?: string;
    includeInactive?: boolean;
  }) {
    const prisma = getPrisma();
    const where: any = { tenantId, deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.inventoryId) where.inventoryId = filters.inventoryId;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
    if (filters?.type) where.type = filters.type;
    if (filters?.scheduledDateFrom || filters?.scheduledDateTo) {
      where.scheduledDate = {};
      if (filters.scheduledDateFrom) where.scheduledDate.gte = new Date(filters.scheduledDateFrom);
      if (filters.scheduledDateTo) where.scheduledDate.lte = new Date(filters.scheduledDateTo);
    }
    if (filters?.includeInactive) { delete where.deletedAt; delete where.isActive; }
    else where.isActive = true;
    return prisma.maintenanceJob.findMany({
      where,
      include: {
        inventory: {
          select: {
            id: true, serialNumber: true, status: true,
            catalogueItem: { select: { name: true, brand: true, model: true } },
            gym: { select: { name: true } },
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    const prisma = getPrisma();
    const item = await prisma.maintenanceJob.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        inventory: {
          select: {
            id: true, serialNumber: true, status: true,
            maintenanceIntervalMonths: true,
            catalogueItem: { select: { name: true, brand: true, model: true } },
            gym: { select: { name: true } },
          },
        },
        statusLogs: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!item) throw new NotFoundError('Maintenance job not found');
    return item;
  }

  async create(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const inventory = await prisma.equipmentInventory.findFirst({
      where: { id: input.inventoryId, tenantId, deletedAt: null },
    });
    if (!inventory) throw new NotFoundError('Inventory item not found');
    if (inventory.status === 'decommissioned' || inventory.status === 'lost_stolen') {
      throw new ValidationError(`Cannot create maintenance job for item in '${inventory.status}' status`);
    }
    if (inventory.status !== 'active' && inventory.status !== 'maintenance') {
      throw new ValidationError(`Inventory must be 'active' or 'maintenance' to schedule maintenance (current: '${inventory.status}')`);
    }

    const scheduledDate = new Date(input.scheduledDate);
    const item = await prisma.maintenanceJob.create({
      data: {
        tenantId,
        inventoryId: input.inventoryId,
        scheduledDate,
        type: input.type ?? 'preventive',
        status: 'scheduled',
        assignedTo: input.assignedTo,
        assignedTechnicianName: input.assignedTechnicianName,
        assignedToType: input.assignedToType ?? 'internal',
        description: input.description,
        estimatedCost: input.estimatedCost ? Number(input.estimatedCost) : undefined,
      },
      include: {
        inventory: {
          select: {
            id: true, serialNumber: true, status: true,
            catalogueItem: { select: { name: true, brand: true, model: true } },
            gym: { select: { name: true } },
          },
        },
      },
    });

    await this.logStatusChange(item.id, tenantId, null, 'scheduled', userId, 'Job created');
    await publishBillingEvent('maintenance.job.scheduled', {
      jobId: item.id, inventoryId: item.inventoryId,
      serialNumber: item.inventory.serialNumber,
      catalogueItemId: item.inventory.catalogueItem?.name,
      catalogueItemName: item.inventory.catalogueItem?.name,
      type: item.type, scheduledDate: item.scheduledDate.toISOString(),
      assignedTo: item.assignedTo,
      estimatedCost: item.estimatedCost ? Number(item.estimatedCost) : null,
    }, { tenantId, userId });
    await auditService.log({
      tenantId, userId, action: 'CREATE', entityType: 'maintenance_job',
      entityId: item.id,
      description: `Created ${item.type} maintenance job for ${item.inventory.serialNumber}`,
      newValue: { inventoryId: item.inventoryId, type: item.type, scheduledDate: item.scheduledDate.toISOString() },
    });

    return this.getById(item.id, tenantId);
  }

  async update(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    const oldValues: Record<string, any> = {};
    const changedFields: string[] = [];

    if (input.status && input.status !== existing.status) {
      const allowed = ALLOWED_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(input.status)) {
        throw new ValidationError(`Cannot transition from '${existing.status}' to '${input.status}'`);
      }
      const needsReason = TRANSITIONS_REQUIRING_REASON[existing.status]?.includes(input.status);
      if (needsReason && (!input.reason || input.reason.length < 1)) {
        throw new ValidationError(`Reason is required for transition from '${existing.status}' to '${input.status}'`);
      }

      await this.enforceTransitionGuards(existing, input, tenantId, userId);
      oldValues.status = existing.status;
      changedFields.push('status');
    }

    if (input.laborCost !== undefined || input.partsCost !== undefined) {
      if (existing.status === 'completed') {
        if (!input.reason) throw new ValidationError('Reason is required to edit costs after completion');
      }
      const laborCost = input.laborCost !== undefined ? Number(input.laborCost) : (existing.laborCost ? Number(existing.laborCost) : 0);
      const partsCost = input.partsCost !== undefined ? Number(input.partsCost) : (existing.partsCost ? Number(existing.partsCost) : 0);
      if (input.totalCost === undefined) {
        input.totalCost = laborCost + partsCost;
      }
      changedFields.push('cost');
    }

    if (input.assignedTo && input.assignedTo !== existing.assignedTo && existing.status === 'in_progress') {
      if (!input.reason) throw new ValidationError('Reason is required for reassignment during active job');
      changedFields.push('assignedTo');
    }

    let item;
    try {
      item = await prisma.maintenanceJob.update({
        where: { id },
        data: {
          status: input.status ?? existing.status,
          scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : existing.scheduledDate,
          type: input.type ?? existing.type,
          assignedTo: input.assignedTo !== undefined ? input.assignedTo : existing.assignedTo,
          assignedTechnicianName: input.assignedTechnicianName !== undefined ? input.assignedTechnicianName : existing.assignedTechnicianName,
          assignedToType: input.assignedToType ?? existing.assignedToType,
          assignedToExternalId: input.assignedToExternalId !== undefined ? input.assignedToExternalId : existing.assignedToExternalId,
          assignedToExternalName: input.assignedToExternalName !== undefined ? input.assignedToExternalName : existing.assignedToExternalName,
          description: input.description !== undefined ? input.description : existing.description,
          outcome: input.outcome !== undefined ? input.outcome : existing.outcome,
          estimatedCost: input.estimatedCost !== undefined ? Number(input.estimatedCost) : existing.estimatedCost,
          laborCost: input.laborCost !== undefined ? Number(input.laborCost) : existing.laborCost,
          partsCost: input.partsCost !== undefined ? Number(input.partsCost) : existing.partsCost,
          totalCost: input.totalCost !== undefined ? Number(input.totalCost) : existing.totalCost,
          partsUsed: input.partsUsed !== undefined ? input.partsUsed : existing.partsUsed,
          invoiceReference: input.invoiceReference !== undefined ? input.invoiceReference : existing.invoiceReference,
          approvedBy: input.approvedBy !== undefined ? input.approvedBy : existing.approvedBy,
          approvedAt: input.approvedAt !== undefined ? new Date(input.approvedAt) : existing.approvedAt,
          startedAt: input.status === 'in_progress' ? (existing.startedAt ?? new Date()) : existing.startedAt,
          completedAt: input.status === 'completed' ? (existing.completedAt ?? new Date()) : existing.completedAt,
        },
        include: {
          inventory: {
            select: {
              id: true, serialNumber: true, status: true,
              maintenanceIntervalMonths: true,
              catalogueItem: { select: { name: true, brand: true, model: true } },
              gym: { select: { name: true } },
            },
          },
        },
      });
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError('A maintenance job with these details already exists');
      }
      throw err;
    }

    if (input.status && input.status !== existing.status) {
      await this.logStatusChange(id, tenantId, existing.status, input.status, userId, input.reason);
      await this.handleInventorySync(existing, input, item, tenantId, userId);
    }

    if (changedFields.includes('status')) {
      await this.publishStatusEvent(existing, item, tenantId, userId, input.reason);
    } else if (changedFields.includes('cost')) {
      await publishBillingEvent('maintenance.job.updated', {
        jobId: id, inventoryId: item.inventoryId,
        serialNumber: item.inventory.serialNumber,
        changedFields,
      }, { tenantId, userId });
    }

    const auditAction = changedFields.includes('status') ? 'STATUS_CHANGE'
      : (changedFields.length > 0 ? 'UPDATE' : undefined);
    if (auditAction) {
      const desc = changedFields.includes('status')
        ? `Maintenance job status: ${existing.status} \u2192 ${item.status}`
        : `Updated maintenance job: ${item.inventory.serialNumber}`;
      await auditService.log({
        tenantId, userId, action: auditAction, entityType: 'maintenance_job', entityId: id,
        description: desc, oldValue: oldValues,
        newValue: { status: item.status, type: item.type },
      });
    }

    return this.getById(item.id, tenantId);
  }

  async delete(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getById(id, tenantId);
    if (!['scheduled', 'cancelled', 'failed'].includes(existing.status)) {
      throw new ValidationError(`Cannot delete job in '${existing.status}' status. Only scheduled, cancelled, or failed jobs can be deleted.`);
    }
    await prisma.maintenanceJob.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    await auditService.log({
      tenantId, userId, action: 'DELETE', entityType: 'maintenance_job', entityId: id,
      description: `Soft-deleted maintenance job for ${existing.inventory.serialNumber}`,
      oldValue: { status: existing.status, type: existing.type },
    });
  }

  async restore(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const item = await prisma.maintenanceJob.findFirst({
      where: { id, tenantId, deletedAt: { not: null } },
    });
    if (!item) throw new NotFoundError('Deleted maintenance job not found');
    const restored = await prisma.maintenanceJob.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });
    await auditService.log({
      tenantId, userId, action: 'RESTORE', entityType: 'maintenance_job', entityId: id,
      description: `Restored maintenance job for inventory ${restored.inventoryId}`,
    });
    return restored;
  }

  private async enforceTransitionGuards(existing: any, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const toStatus = input.status;
    const inventoryId = existing.inventoryId;

    if (existing.status === 'scheduled' && toStatus === 'in_progress') {
      if (!existing.assignedTo && !input.assignedTo) {
        throw new ValidationError('A technician must be assigned before starting maintenance');
      }
      const inventory = await prisma.equipmentInventory.findUnique({ where: { id: inventoryId } });
      if (!inventory || inventory.status !== 'active') {
        throw new ValidationError(`Inventory must be 'active' to start maintenance (current: '${inventory?.status}')`);
      }
      const activeJobs = await prisma.maintenanceJob.count({
        where: { inventoryId, tenantId, status: { in: ['scheduled', 'in_progress'] }, deletedAt: null, id: { not: existing.id } },
      });
      if (activeJobs > 0) {
        throw new ValidationError('Another active maintenance job already exists for this equipment');
      }
      const estimatedCost = input.estimatedCost !== undefined ? Number(input.estimatedCost) : (existing.estimatedCost ? Number(existing.estimatedCost) : 0);
      if (estimatedCost > AUTO_APPROVAL_LIMIT) {
        const approved = input.approvedBy && input.approvedAt;
        if (!approved) {
          throw new ValidationError(`Estimated cost exceeds approval limit of \u20B9${AUTO_APPROVAL_LIMIT.toLocaleString()}. Approval required before starting.`);
        }
      }
    }

    if (existing.status === 'in_progress' && toStatus === 'completed') {
      const laborCost = input.laborCost !== undefined ? Number(input.laborCost) : (existing.laborCost ? Number(existing.laborCost) : 0);
      const partsCost = input.partsCost !== undefined ? Number(input.partsCost) : (existing.partsCost ? Number(existing.partsCost) : 0);
      const totalCost = input.totalCost !== undefined ? Number(input.totalCost) : (laborCost + partsCost);
      if (totalCost === 0 && laborCost === 0 && partsCost === 0) {
        throw new ValidationError('Total cost must be recorded to complete a maintenance job');
      }
      const estimatedCost = existing.estimatedCost ? Number(existing.estimatedCost) : 0;
      if (estimatedCost > 0 && totalCost > estimatedCost * COST_OVERRUN_THRESHOLD) {
        if (!input.approvedBy || !input.approvedAt) {
          throw new ValidationError(`Total cost exceeds estimated cost by more than 20%. Additional approval required.`);
        }
      }
    }

    if (existing.status === 'failed' && toStatus === 'scheduled') {
      const inventory = await prisma.equipmentInventory.findUnique({ where: { id: inventoryId } });
      if (!inventory || inventory.status === 'decommissioned' || inventory.status === 'lost_stolen') {
        throw new ValidationError(`Cannot retry maintenance for item in '${inventory?.status}' status`);
      }
    }
  }

  private async handleInventorySync(existing: any, input: any, item: any, tenantId: string, userId: string) {
    const toStatus = input.status;
    const inventoryId = existing.inventoryId;

    if (existing.status === 'scheduled' && toStatus === 'in_progress') {
      const inv = await getPrisma().equipmentInventory.update({
        where: { id: inventoryId },
        data: { status: 'maintenance' },
      });
      await publishBillingEvent('equipment.inventory.status.changed', {
        inventoryId, serialNumber: inv.serialNumber,
        catalogueItemId: inv.catalogueItemId,
        fromStatus: 'active', toStatus: 'maintenance',
        reason: `Maintenance job started: ${item.id}`,
      }, { tenantId, userId });
    }

    if (toStatus === 'completed' && existing.status === 'in_progress') {
      const inventory = await getPrisma().equipmentInventory.findUnique({ where: { id: inventoryId } });
      if (!inventory) return;
      const completedAt = new Date();
      const months = inventory.maintenanceIntervalMonths ?? 6;
      const nextMaintenance = new Date(completedAt);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + months);
      const inv = await getPrisma().equipmentInventory.update({
        where: { id: inventoryId },
        data: {
          status: 'active',
          lastMaintenanceAt: completedAt,
          nextMaintenanceAt: nextMaintenance,
        },
      });
      await publishBillingEvent('equipment.inventory.status.changed', {
        inventoryId, serialNumber: inv.serialNumber,
        catalogueItemId: inv.catalogueItemId,
        fromStatus: 'maintenance', toStatus: 'active',
        reason: `Maintenance completed: ${item.id}`,
      }, { tenantId, userId });
      await publishBillingEvent('equipment.inventory.updated', {
        inventoryId, serialNumber: inv.serialNumber,
        changedFields: ['lastMaintenanceAt', 'nextMaintenanceAt', 'status'],
      }, { tenantId, userId });
    }

    if (toStatus === 'cancelled' && existing.status === 'in_progress') {
      const inv = await getPrisma().equipmentInventory.update({
        where: { id: inventoryId },
        data: { status: 'active' },
      });
      await publishBillingEvent('equipment.inventory.status.changed', {
        inventoryId, serialNumber: inv.serialNumber,
        catalogueItemId: inv.catalogueItemId,
        fromStatus: 'maintenance', toStatus: 'active',
        reason: `Maintenance cancelled: ${item.id}`,
      }, { tenantId, userId });
    }
  }

  private async publishStatusEvent(existing: any, item: any, tenantId: string, userId: string, reason?: string) {
    const basePayload = {
      jobId: item.id, inventoryId: item.inventoryId,
      serialNumber: item.inventory.serialNumber,
    };

    switch (item.status) {
      case 'in_progress':
        await publishBillingEvent('maintenance.job.started', {
          ...basePayload, startedAt: new Date().toISOString(),
        }, { tenantId, userId });
        break;
      case 'completed':
        await publishBillingEvent('maintenance.job.completed', {
          ...basePayload,
          completedAt: new Date().toISOString(),
          totalCost: item.totalCost ? Number(item.totalCost) : null,
          laborCost: item.laborCost ? Number(item.laborCost) : null,
          partsCost: item.partsCost ? Number(item.partsCost) : null,
          outcome: item.outcome,
          nextMaintenanceAt: item.inventory.nextMaintenanceAt?.toISOString() ?? null,
        }, { tenantId, userId });
        break;
      case 'cancelled':
        await publishBillingEvent('maintenance.job.cancelled', {
          ...basePayload, reason: reason || null,
          previousStatus: existing.status,
        }, { tenantId, userId });
        break;
      case 'failed':
        await publishBillingEvent('maintenance.job.failed', {
          ...basePayload, reason: reason || null,
          outcome: item.outcome,
        }, { tenantId, userId });
        break;
    }
  }

  private async logStatusChange(jobId: string, tenantId: string, fromStatus: string | null, toStatus: string, changedBy: string, reason?: string) {
    const prisma = getPrisma();
    await prisma.maintenanceStatusLog.create({
      data: { tenantId, jobId, fromStatus, toStatus, changedBy, reason },
    });
  }
}

export const equipmentMaintenanceService = new EquipmentMaintenanceService();
