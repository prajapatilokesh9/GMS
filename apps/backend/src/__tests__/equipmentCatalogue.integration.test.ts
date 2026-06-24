import app from '../core/app';
import request from 'supertest';
import { getPrisma } from '../database/prisma.service';

jest.mock('../events/event-bus', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
  createWorker: jest.fn(),
  getDLQJobs: jest.fn().mockResolvedValue([]),
  requeueDLQJob: jest.fn().mockResolvedValue(false),
}));

import { publishEvent } from '../events/event-bus';
const mockPublishEvent = publishEvent as jest.Mock;

const prisma = getPrisma();
const testId = Date.now();
let accessToken: string;
let tenantId: string;
let secondTenantId: string;
let catalogueId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `Equipment Test Tenant B ${testId}`, slug: `equip-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('Equipment Catalogue — Setup', () => {
  test('POST /api/v1/auth/login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    accessToken = res.body.data.tokens.accessToken;
  });
});

describe('Equipment Catalogue — CRUD', () => {
  test('POST /api/v1/equipment/catalogue creates an item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Treadmill Pro ${testId}`,
        sku: `TREAD-${testId}`,
        brand: 'FitTech',
        model: `TT-X1-${testId}`,
        category: 'Cardio Equipment',
        subcategory: 'Treadmills',
        unitCost: 1299.99,
        warrantyMonths: 24,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`Treadmill Pro ${testId}`);
    expect(res.body.data.sku).toBe(`TREAD-${testId}`);
    expect(res.body.data.brand).toBe('FitTech');
    expect(res.body.data.model).toBe(`TT-X1-${testId}`);
    expect(res.body.data.unitCost).toBe('1299.99');
    expect(res.body.data.warrantyMonths).toBe(24);
    catalogueId = res.body.data.id;
  });

  test('GET /api/v1/equipment/catalogue lists items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/equipment/catalogue/:id returns item details', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/catalogue/${catalogueId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(catalogueId);
    expect(res.body.data.brand).toBe('FitTech');
    expect(res.body.data.model).toBe(`TT-X1-${testId}`);
  });

  test('PATCH /api/v1/equipment/catalogue/:id updates item fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${catalogueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ unitCost: 1199.99, warrantyMonths: 36 });
    expect(res.status).toBe(200);
    expect(res.body.data.unitCost).toBe('1199.99');
    expect(res.body.data.warrantyMonths).toBe(36);
  });

  test('PATCH /api/v1/equipment/catalogue/:id deactivates item', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${catalogueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    const reactivate = await request(app)
      .patch(`/api/v1/equipment/catalogue/${catalogueId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true });
    expect(reactivate.status).toBe(200);
    expect(reactivate.body.data.isActive).toBe(true);
  });

  test('DELETE /api/v1/equipment/catalogue/:id soft-deletes item', async () => {
    const res = await request(app)
      .delete(`/api/v1/equipment/catalogue/${catalogueId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/equipment/catalogue excludes soft-deleted items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((i: any) => i.id);
    expect(ids).not.toContain(catalogueId);
  });

  test('POST /api/v1/equipment/catalogue/:id/restore restores item', async () => {
    const res = await request(app)
      .post(`/api/v1/equipment/catalogue/${catalogueId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);

    const list = await request(app)
      .get('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = list.body.data.map((i: any) => i.id);
    expect(ids).toContain(catalogueId);
  });

  test('GET /api/v1/equipment/catalogue/:id returns 404 for non-existent item', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/equipment/catalogue rejects duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Duplicate SKU Item',
        sku: `TREAD-${testId}`,
        brand: 'OtherBrand',
        model: 'OB-100',
        category: 'Strength Training',
        unitCost: 500,
      });
    expect(res.status).toBe(409);
  });

  test('POST /api/v1/equipment/catalogue rejects duplicate brand/model', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Duplicate Brand Model',
        sku: `OTHER-${testId}`,
        brand: 'FitTech',
        model: `TT-X1-${testId}`,
        category: 'Cardio Equipment',
        unitCost: 999,
      });
    expect(res.status).toBe(409);
  });
});

describe('Equipment Catalogue — Events', () => {
  test('creating an item publishes equipment.catalogue.created', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Create ${testId}`,
        sku: `EVT-CR-${testId}`,
        brand: `EventBrand-${testId}`,
        model: `EV-100-${testId}`,
        category: 'Cardio Equipment',
        unitCost: 999,
      });
    expect(res.status).toBe(201);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.catalogue.created',
    }));
  });

  test('updating an item publishes equipment.catalogue.updated', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Update ${testId}`,
        sku: `EVT-UP-${testId}`,
        brand: `EventBrand-${testId}`,
        model: `EV-200-${testId}`,
        category: 'Strength Training',
        unitCost: 500,
      });
    const itemId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/equipment/catalogue/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ unitCost: 450 });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.catalogue.updated',
    }));
  });

  test('deactivating an item publishes equipment.catalogue.deactivated', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Deactivate ${testId}`,
        sku: `EVT-DA-${testId}`,
        brand: `EventBrand-${testId}`,
        model: `EV-300-${testId}`,
        category: 'Strength Training',
        unitCost: 300,
      });
    const itemId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/equipment/catalogue/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.catalogue.deactivated',
    }));
  });

  test('soft-deleting an item publishes equipment.catalogue.deactivated', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Delete ${testId}`,
        sku: `EVT-DL-${testId}`,
        brand: `EventBrand-${testId}`,
        model: `EV-400-${testId}`,
        category: 'Cardio Equipment',
        unitCost: 700,
      });
    const itemId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .delete(`/api/v1/equipment/catalogue/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.catalogue.deactivated',
    }));
  });

  test('restoring an item publishes equipment.catalogue.restored', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Restore ${testId}`,
        sku: `EVT-RS-${testId}`,
        brand: `EventBrand-${testId}`,
        model: `EV-500-${testId}`,
        category: 'Strength Training',
        unitCost: 600,
      });
    const itemId = body.data.id;
    await request(app)
      .delete(`/api/v1/equipment/catalogue/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    mockPublishEvent.mockClear();

    await request(app)
      .post(`/api/v1/equipment/catalogue/${itemId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.catalogue.restored',
    }));
  });
});

describe('Equipment Catalogue — RBAC & Authorization', () => {
  test('GET /api/v1/equipment/catalogue rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/equipment/catalogue');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/equipment/catalogue rejects without auth token', async () => {
    const res = await request(app).post('/api/v1/equipment/catalogue').send({ name: 'test', sku: 'T-001', brand: 'B', model: 'M1', category: 'C', unitCost: 100 });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/equipment/catalogue/:id rejects without auth token', async () => {
    const res = await request(app).get(`/api/v1/equipment/catalogue/${catalogueId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/equipment/catalogue/:id rejects without auth token', async () => {
    const res = await request(app).patch(`/api/v1/equipment/catalogue/${catalogueId}`).send({ unitCost: 100 });
    expect(res.status).toBe(401);
  });

  test('DELETE /api/v1/equipment/catalogue/:id rejects without auth token', async () => {
    const res = await request(app).delete(`/api/v1/equipment/catalogue/${catalogueId}`);
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/equipment/catalogue/:id/restore rejects without auth token', async () => {
    const res = await request(app).post(`/api/v1/equipment/catalogue/${catalogueId}/restore`);
    expect(res.status).toBe(401);
  });
});

describe('Equipment Catalogue — Multi-Tenancy', () => {
  let otherItemId: string;

  test('creates an item in a different tenant', async () => {
    const otherItem = await prisma.equipmentCatalogue.create({
      data: {
        tenantId: secondTenantId,
        name: `Other Tenant Equipment ${testId}`,
        sku: `OTHER-${testId}`,
        brand: 'OtherBrand',
        model: `OB-100-${testId}`,
        category: 'Strength Training',
        unitCost: 500,
      },
    });
    otherItemId = otherItem.id;
  });

  test('GET /api/v1/equipment/catalogue list does not leak cross-tenant items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((i: any) => i.id);
    expect(ids).not.toContain(otherItemId);
  });

  test('GET /api/v1/equipment/catalogue/:id returns 404 for cross-tenant item', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/catalogue/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/equipment/catalogue/:id rejects update of cross-tenant item', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ unitCost: 100 });
    expect(res.status).toBe(404);
  });

  test('DELETE /api/v1/equipment/catalogue/:id rejects delete of cross-tenant item', async () => {
    const res = await request(app)
      .delete(`/api/v1/equipment/catalogue/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/equipment/catalogue/:id/restore rejects restore of cross-tenant item', async () => {
    const res = await request(app)
      .post(`/api/v1/equipment/catalogue/${otherItemId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Equipment Catalogue — Validation', () => {
  test('POST /api/v1/equipment/catalogue rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sku: 'VAL-001', brand: 'B', model: 'M1', category: 'C', unitCost: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects missing SKU', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', brand: 'B', model: 'M1', category: 'C', unitCost: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects missing brand', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', sku: 'VAL-002', model: 'M1', category: 'C', unitCost: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects missing model', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', sku: 'VAL-003', brand: 'B', category: 'C', unitCost: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects missing category', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', sku: 'VAL-004', brand: 'B', model: 'M1', unitCost: 100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects missing unitCost', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', sku: 'VAL-005', brand: 'B', model: 'M1', category: 'C' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects negative unitCost', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Neg Cost ${testId}`,
        sku: `NEG-${testId}`,
        brand: 'B',
        model: 'M1',
        category: 'C',
        unitCost: -100,
      });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/equipment/catalogue rejects zero unitCost', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Zero Cost ${testId}`,
        sku: `ZERO-${testId}`,
        brand: 'B',
        model: 'M1',
        category: 'C',
        unitCost: 0,
      });
    expect(res.status).toBe(400);
  });
});

describe('Equipment Catalogue — Pagination & Sorting', () => {
  const paginationTestId = `PAG-${testId}`;

  beforeAll(async () => {
    const prismaLocal = getPrisma();
    for (let i = 0; i < 5; i++) {
      await prismaLocal.equipmentCatalogue.create({
        data: {
          tenantId,
          name: `Pagination Item ${i} ${paginationTestId}`,
          sku: `PAG-SKU-${i}-${testId}`,
          brand: `Brand${String.fromCharCode(65 + i)}-${testId}`,
          model: `Model-${i}-${paginationTestId}`,
          category: 'Test Category',
          unitCost: 100 + i * 10,
        },
      });
    }
  });

  test('GET /api/v1/equipment/catalogue returns items sorted alphabetically by brand', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const items = res.body.data
      .filter((i: any) => i.name.includes(paginationTestId));
    const brands = items.map((i: any) => i.brand);
    expect(brands.length).toBeGreaterThanOrEqual(5);
    expect(brands).toEqual([...brands].sort());
  });

  test('GET /api/v1/equipment/catalogue filters by category', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/catalogue?category=Test Category')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((i: any) => {
      expect(i.category).toBe('Test Category');
    });
  });

  test('GET /api/v1/equipment/catalogue filters by brand', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/catalogue?brand=BrandA-${testId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((i: any) => {
      expect(i.brand).toBe(`BrandA-${testId}`);
    });
  });

  test('GET /api/v1/equipment/catalogue with includeInactive returns inactive items', async () => {
    const item = await getPrisma().equipmentCatalogue.findFirst({
      where: { tenantId, name: { contains: 'Pagination Item 0' } },
    });
    await getPrisma().equipmentCatalogue.update({
      where: { id: item!.id },
      data: { isActive: false },
    });

    const res = await request(app)
      .get('/api/v1/equipment/catalogue?includeInactive=true')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const match = res.body.data.find((i: any) => i.id === item!.id);
    expect(match).toBeTruthy();
    expect(match.isActive).toBe(false);

    await getPrisma().equipmentCatalogue.update({
      where: { id: item!.id },
      data: { isActive: true },
    });
  });
});

describe('Equipment Catalogue — Soft-Delete Edge Cases', () => {
  let deletedItemId: string;

  beforeAll(async () => {
    const item = await getPrisma().equipmentCatalogue.create({
      data: {
        tenantId,
        name: `Delete Edge ${testId}`,
        sku: `DEL-EDGE-${testId}`,
        brand: `EdgeBrand-${testId}`,
        model: `Edge-100-${testId}`,
        category: 'Edge Category',
        unitCost: 250,
      },
    });
    deletedItemId = item.id;
    await getPrisma().equipmentCatalogue.update({
      where: { id: item.id },
      data: { isActive: false, deletedAt: new Date() },
    });
  });

  test('GET /api/v1/equipment/catalogue/:id returns 404 for soft-deleted item', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/catalogue/${deletedItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/equipment/catalogue/:id returns 404 for soft-deleted item', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${deletedItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ unitCost: 100 });
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/equipment/catalogue/:id/restore returns 404 for already-restored item', async () => {
    await getPrisma().equipmentCatalogue.update({
      where: { id: deletedItemId },
      data: { isActive: true, deletedAt: null },
    });
    const res = await request(app)
      .post(`/api/v1/equipment/catalogue/${deletedItemId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);

    await getPrisma().equipmentCatalogue.update({
      where: { id: deletedItemId },
      data: { isActive: false, deletedAt: new Date() },
    });
  });
});

describe('Equipment Catalogue — Duplicate Conflict Scenarios', () => {
  test('POST /api/v1/equipment/catalogue rejects duplicate SKU even after soft-delete', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Conflict SKU ${testId}`,
        sku: `CONF-SKU-${testId}`,
        brand: `ConflictBrand-${testId}`,
        model: `Conflict-100-${testId}`,
        category: 'Conflict Category',
        unitCost: 150,
      });
    const itemId = body.data.id;
    await request(app)
      .delete(`/api/v1/equipment/catalogue/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Reused SKU Attempt',
        sku: `CONF-SKU-${testId}`,
        brand: 'Other',
        model: 'Other-100',
        category: 'Other',
        unitCost: 200,
      });
    expect(res.status).toBe(409);
  });

  test('PATCH /api/v1/equipment/catalogue/:id rejects SKU change to existing SKU', async () => {
    const { body: first } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Patch Conflict First',
        sku: `PATCH-CONF-1-${testId}`,
        brand: `PatchBrand-${testId}`,
        model: `Patch-100-${testId}`,
        category: 'Patch Category',
        unitCost: 100,
      });
    const { body: second } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Patch Conflict Second',
        sku: `PATCH-CONF-2-${testId}`,
        brand: `PatchBrand-${testId}`,
        model: `Patch-200-${testId}`,
        category: 'Patch Category',
        unitCost: 200,
      });

    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${second.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sku: `PATCH-CONF-1-${testId}` });
    expect(res.status).toBe(409);
  });

  test('PATCH /api/v1/equipment/catalogue/:id rejects brand/model change to existing combo', async () => {
    const { body: first } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Patch Combo First',
        sku: `PATCH-CMB-1-${testId}`,
        brand: `ComboBrand-${testId}`,
        model: `Combo-100-${testId}`,
        category: 'Combo Category',
        unitCost: 100,
      });
    const { body: second } = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Patch Combo Second',
        sku: `PATCH-CMB-2-${testId}`,
        brand: `ComboBrand-${testId}`,
        model: `Combo-200-${testId}`,
        category: 'Combo Category',
        unitCost: 200,
      });

    const res = await request(app)
      .patch(`/api/v1/equipment/catalogue/${second.data.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ brand: `ComboBrand-${testId}`, model: `Combo-100-${testId}` });
    expect(res.status).toBe(409);
  });
});

describe('Equipment Catalogue — Audit Logging', () => {
  test('creating an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_catalogue', entityId: catalogueId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
  });

  test('updating an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_catalogue', entityId: catalogueId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('UPDATE');
  });

  test('deleting an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_catalogue', entityId: catalogueId, action: 'DELETE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('DELETE');
  });

  test('restoring an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_catalogue', entityId: catalogueId, action: 'RESTORE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('RESTORE');
  });
});
