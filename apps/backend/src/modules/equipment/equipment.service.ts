import { getPrisma } from '../../database/prisma.service';
import { NotFoundError, ConflictError } from '../common/errors/AppError';
import { Prisma } from '@prisma/client';
import { auditService } from '../common/utils/audit';
import { publishBillingEvent } from '../../events/producers/billingEvents';

export class EquipmentService {
  async listCatalogue(tenantId: string, filters?: { category?: string; brand?: string; isActive?: boolean; includeInactive?: boolean }) {
    const prisma = getPrisma();
    const where: any = { tenantId, deletedAt: null };
    if (filters?.category) where.category = filters.category;
    if (filters?.brand) where.brand = filters.brand;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.includeInactive) delete where.isActive;
    return prisma.equipmentCatalogue.findMany({ where, orderBy: { brand: 'asc' } });
  }

  async getCatalogue(id: string, tenantId: string) {
    const prisma = getPrisma();
    const item = await prisma.equipmentCatalogue.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!item) throw new NotFoundError('Equipment catalogue item not found');
    return item;
  }

  async createCatalogue(input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    let item;
    try {
      item = await prisma.equipmentCatalogue.create({
        data: {
          tenantId,
          name: input.name,
          sku: input.sku,
          brand: input.brand,
          model: input.model,
          category: input.category,
          subcategory: input.subcategory,
          specs: input.specs || {},
          unitCost: input.unitCost,
          warrantyMonths: input.warrantyMonths ?? 12,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[])?.join(', ') || 'fields';
        throw new ConflictError(`A catalogue item with this ${target} already exists for this tenant`);
      }
      throw err;
    }
    await publishBillingEvent('equipment.catalogue.created', { catalogueId: item.id, name: item.name, brand: item.brand, model: item.model, sku: item.sku, category: item.category, unitCost: Number(item.unitCost) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'CREATE', entityType: 'equipment_catalogue', entityId: item.id, description: `Created equipment catalogue: ${item.brand} ${item.model} (${item.name})`, newValue: { name: item.name, brand: item.brand, model: item.model, sku: item.sku, category: item.category, unitCost: Number(item.unitCost) } });
    return item;
  }

  async updateCatalogue(id: string, input: any, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getCatalogue(id, tenantId);
    let item;
    try {
      item = await prisma.equipmentCatalogue.update({
        where: { id },
        data: {
          name: input.name ?? existing.name,
          sku: input.sku ?? existing.sku,
          brand: input.brand ?? existing.brand,
          model: input.model ?? existing.model,
          category: input.category ?? existing.category,
          subcategory: input.subcategory !== undefined ? input.subcategory : existing.subcategory,
          specs: input.specs ?? existing.specs,
          unitCost: input.unitCost !== undefined ? input.unitCost : existing.unitCost,
          warrantyMonths: input.warrantyMonths !== undefined ? input.warrantyMonths : existing.warrantyMonths,
          isActive: input.isActive ?? existing.isActive,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const target = (err.meta?.target as string[])?.join(', ') || 'fields';
        throw new ConflictError(`A catalogue item with this ${target} already exists for this tenant`);
      }
      throw err;
    }
    if (existing.isActive && !item.isActive) {
      await publishBillingEvent('equipment.catalogue.deactivated', { catalogueId: id, name: item.name, brand: item.brand, model: item.model, reason: 'manual' }, { tenantId, userId });
    } else {
      await publishBillingEvent('equipment.catalogue.updated', { catalogueId: id, name: item.name, brand: item.brand, model: item.model, sku: item.sku, unitCost: Number(item.unitCost) }, { tenantId, userId });
    }
    await auditService.log({ tenantId, userId, action: 'UPDATE', entityType: 'equipment_catalogue', entityId: id, description: `Updated equipment catalogue: ${item.brand} ${item.model}`, oldValue: { name: existing.name, brand: existing.brand, model: existing.model, sku: existing.sku, unitCost: Number(existing.unitCost) }, newValue: { name: item.name, brand: item.brand, model: item.model, sku: item.sku, unitCost: Number(item.unitCost) } });
    return item;
  }

  async deleteCatalogue(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const existing = await this.getCatalogue(id, tenantId);
    await prisma.equipmentCatalogue.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });
    await publishBillingEvent('equipment.catalogue.deactivated', { catalogueId: id, name: existing.name, brand: existing.brand, model: existing.model, reason: 'soft-delete' }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'DELETE', entityType: 'equipment_catalogue', entityId: id, description: `Soft-deleted equipment catalogue: ${existing.brand} ${existing.model}`, oldValue: { name: existing.name, brand: existing.brand, model: existing.model, sku: existing.sku } });
  }

  async restoreCatalogue(id: string, tenantId: string, userId: string) {
    const prisma = getPrisma();
    const item = await prisma.equipmentCatalogue.findFirst({
      where: { id, tenantId, deletedAt: { not: null } },
    });
    if (!item) throw new NotFoundError('Deleted catalogue item not found');
    const restored = await prisma.equipmentCatalogue.update({
      where: { id },
      data: { isActive: true, deletedAt: null },
    });
    await publishBillingEvent('equipment.catalogue.restored', { catalogueId: id, name: restored.name, brand: restored.brand, model: restored.model, sku: restored.sku, category: restored.category, unitCost: Number(restored.unitCost) }, { tenantId, userId });
    await auditService.log({ tenantId, userId, action: 'RESTORE', entityType: 'equipment_catalogue', entityId: id, description: `Restored equipment catalogue: ${restored.brand} ${restored.model}` });
    return restored;
  }
}

export const equipmentService = new EquipmentService();
