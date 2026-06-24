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
let gymId: string;
let catalogueId: string;
let inventoryId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `Inventory Test Tenant B ${testId}`, slug: `inv-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('Equipment Inventory — Setup', () => {
  test('POST /api/v1/auth/login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    accessToken = res.body.data.tokens.accessToken;
  });

  test('POST /api/v1/gyms creates test gym', async () => {
    const res = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Inventory Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });

  test('POST /api/v1/equipment/catalogue creates test catalogue item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Inv Test Treadmill ${testId}`,
        sku: `INV-TREAD-${testId}`,
        brand: 'InvTestBrand',
        model: `IT-X1-${testId}`,
        category: 'Cardio',
        unitCost: 1500,
        warrantyMonths: 24,
      });
    expect(res.status).toBe(201);
    catalogueId = res.body.data.id;
  });
});

describe('Equipment Inventory — CRUD', () => {
  test('POST /api/v1/equipment/inventory creates an item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        catalogueItemId: catalogueId,
        serialNumber: `SN-${testId}`,
        gymId,
        purchaseDate: '2025-01-15',
        purchaseCost: 1299.99,
        supplier: 'FitSupplier Co',
        warrantyStartDate: '2025-01-15',
        warrantyEndDate: '2027-01-15',
        maintenanceIntervalMonths: 6,
        status: 'ordered',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.serialNumber).toBe(`SN-${testId}`);
    expect(res.body.data.status).toBe('ordered');
    expect(res.body.data.gymId).toBe(gymId);
    expect(res.body.data.catalogueItemId).toBe(catalogueId);
    inventoryId = res.body.data.id;
  });

  test('GET /api/v1/equipment/inventory lists items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/equipment/inventory/:id returns item', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(inventoryId);
    expect(res.body.data.serialNumber).toBe(`SN-${testId}`);
  });

  test('PATCH /api/v1/equipment/inventory/:id updates non-status fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: 'Floor 2 - Cardio Zone', notes: 'Near window' });
    expect(res.status).toBe(200);
    expect(res.body.data.location).toBe('Floor 2 - Cardio Zone');
    expect(res.body.data.notes).toBe('Near window');
  });

  test('DELETE /api/v1/equipment/inventory/:id soft-deletes item', async () => {
    const res = await request(app)
      .delete(`/api/v1/equipment/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  test('GET /api/v1/equipment/inventory excludes soft-deleted items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((i: any) => i.id);
    expect(ids).not.toContain(inventoryId);
  });

  test('POST /api/v1/equipment/inventory/:id/restore restores item', async () => {
    const res = await request(app)
      .post(`/api/v1/equipment/inventory/${inventoryId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
    expect(res.body.data.deletedAt).toBeNull();
  });
});

describe('Equipment Inventory — State Machine Transitions', () => {
  test('ordered → delivered succeeds without reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T1-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'ordered' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'delivered' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('delivered');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('delivered → active succeeds without reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T2-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'delivered' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('active → maintenance succeeds', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T3-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'active' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'maintenance' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('maintenance');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('active → under_repair requires reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T4-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'active' });
    const id = body.data.id;

    const noReason = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'under_repair' });
    expect(noReason.status).toBe(400);

    const withReason = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'under_repair', reason: 'Motor malfunction detected' });
    expect(withReason.status).toBe(200);
    expect(withReason.body.data.status).toBe('under_repair');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('active → damaged requires reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T5-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'active' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'damaged', reason: 'Frame cracked during use' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('damaged');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('active → lost_stolen requires reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T6-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'active' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'lost_stolen', reason: 'Reported missing after closing hours' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('lost_stolen');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('lost_stolen → active requires 20+ char reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T7-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'lost_stolen' });
    const id = body.data.id;

    const shortReason = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active', reason: 'Found it' });
    expect(shortReason.status).toBe(400);

    const longEnough = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active', reason: 'Equipment recovered from lost and found area in storage room B' });
    expect(longEnough.status).toBe(200);
    expect(longEnough.body.data.status).toBe('active');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('damaged → under_repair requires reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T8-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'damaged' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'under_repair', reason: 'Sent to certified repair center' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('under_repair');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('decommissioned is terminal — no outgoing transitions', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T9-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'active' });
    const id = body.data.id;
    await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'decommissioned', reason: 'End of useful life reached' });

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'active' });
    expect(res.status).toBe(400);

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('ordered → maintenance is rejected (invalid transition)', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T10-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'ordered' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'maintenance' });
    expect(res.status).toBe(400);

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('delivered → damaged is rejected (invalid transition)', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T11-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'delivered' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'damaged', reason: 'Damaged in transit' });
    expect(res.status).toBe(400);

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('ordered → decommissioned requires reason', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-T12-${testId}`, gymId, purchaseDate: '2025-02-01', status: 'ordered' });
    const id = body.data.id;

    const noReason = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'decommissioned' });
    expect(noReason.status).toBe(400);

    const withReason = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'decommissioned', reason: 'Order cancelled before delivery' });
    expect(withReason.status).toBe(200);
    expect(withReason.body.data.status).toBe('decommissioned');
  });
});

describe('Equipment Inventory — Gym Transfer', () => {
  let secondGymId: string;
  let transferItemId: string;

  beforeAll(async () => {
    const gym = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Second Gym ${testId}`, city: 'Delhi' });
    secondGymId = gym.body.data.id;

    const item = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-TRANSFER-${testId}`, gymId, purchaseDate: '2025-03-01', status: 'active' });
    transferItemId = item.body.data.id;
  });

  test('Transfer without reason is rejected', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${transferItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId: secondGymId });
    expect(res.status).toBe(400);
  });

  test('Transfer with short reason is rejected', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${transferItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId: secondGymId, reason: 'Short' });
    expect(res.status).toBe(400);
  });

  test('Transfer succeeds with valid reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${transferItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId: secondGymId, reason: 'Reallocating equipment to new Delhi branch location' });
    expect(res.status).toBe(200);
    expect(res.body.data.gymId).toBe(secondGymId);
  });

  test('Transfer is blocked for non-active/maintenance status', async () => {
    const item = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-TRANSFER2-${testId}`, gymId, purchaseDate: '2025-03-01', status: 'under_repair' });
    const id = item.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId: secondGymId, reason: 'Attempting to transfer under repair equipment between locations' });
    expect(res.status).toBe(400);

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('Transfer with status change publishes both events', async () => {
    mockPublishEvent.mockClear();
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-DUAL-${testId}`, gymId, purchaseDate: '2025-03-01', status: 'maintenance' });
    const id = body.data.id;

    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId: secondGymId, status: 'active', reason: 'Repaired and moving to secondary location for deployment' });
    expect(res.status).toBe(200);
    expect(res.body.data.gymId).toBe(secondGymId);
    expect(res.body.data.status).toBe('active');
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({ eventName: 'equipment.inventory.status.changed' }));

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });
});

describe('Equipment Inventory — Events', () => {
  test('creating an item publishes equipment.inventory.created', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-EVT1-${testId}`, gymId, purchaseDate: '2025-04-01' });
    const id = body.data.id;
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.inventory.created',
    }));

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('updating non-status fields publishes equipment.inventory.updated', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-EVT2-${testId}`, gymId, purchaseDate: '2025-04-01' });
    const id = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: 'Updated location' });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.inventory.updated',
    }));

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('status change publishes equipment.inventory.status.changed', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-EVT3-${testId}`, gymId, purchaseDate: '2025-04-01', status: 'ordered' });
    const id = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'delivered' });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.inventory.status.changed',
    }));

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('soft-deleting publishes equipment.inventory.deactivated', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-EVT4-${testId}`, gymId, purchaseDate: '2025-04-01', status: 'active' });
    const id = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .delete(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.inventory.deactivated',
    }));
  });

  test('restoring publishes equipment.inventory.restored', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-EVT5-${testId}`, gymId, purchaseDate: '2025-04-01', status: 'active' });
    const id = body.data.id;
    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
    mockPublishEvent.mockClear();

    await request(app)
      .post(`/api/v1/equipment/inventory/${id}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'equipment.inventory.restored',
    }));
  });
});

describe('Equipment Inventory — RBAC & Authorization', () => {
  test('GET /api/v1/equipment/inventory rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/equipment/inventory');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/equipment/inventory rejects without auth token', async () => {
    const res = await request(app).post('/api/v1/equipment/inventory').send({ catalogueItemId: catalogueId, serialNumber: 'NO-AUTH', gymId, purchaseDate: '2025-01-01' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/equipment/inventory/:id rejects without auth token', async () => {
    const res = await request(app).get(`/api/v1/equipment/inventory/${inventoryId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/equipment/inventory/:id rejects without auth token', async () => {
    const res = await request(app).patch(`/api/v1/equipment/inventory/${inventoryId}`).send({ location: 'test' });
    expect(res.status).toBe(401);
  });

  test('DELETE /api/v1/equipment/inventory/:id rejects without auth token', async () => {
    const res = await request(app).delete(`/api/v1/equipment/inventory/${inventoryId}`);
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/equipment/inventory/:id/restore rejects without auth token', async () => {
    const res = await request(app).post(`/api/v1/equipment/inventory/${inventoryId}/restore`);
    expect(res.status).toBe(401);
  });
});

describe('Equipment Inventory — Multi-Tenancy', () => {
  let otherItemId: string;

  test('creates an item in a different tenant', async () => {
    const otherItem = await prisma.equipmentInventory.create({
      data: {
        tenantId: secondTenantId,
        catalogueItemId: catalogueId,
        serialNumber: `OTHER-SN-${testId}`,
        gymId,
        purchaseDate: new Date('2025-01-01'),
        maintenanceIntervalMonths: 6,
        nextMaintenanceAt: new Date('2025-07-01'),
        status: 'active',
      },
    });
    otherItemId = otherItem.id;
  });

  test('GET list does not leak cross-tenant items', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((i: any) => i.id);
    expect(ids).not.toContain(otherItemId);
  });

  test('GET :id returns 404 for cross-tenant item', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/inventory/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH rejects update of cross-tenant item', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: 'hacker location' });
    expect(res.status).toBe(404);
  });

  test('DELETE rejects delete of cross-tenant item', async () => {
    const res = await request(app)
      .delete(`/api/v1/equipment/inventory/${otherItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /restore rejects restore of cross-tenant item', async () => {
    const res = await request(app)
      .post(`/api/v1/equipment/inventory/${otherItemId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Equipment Inventory — Validation', () => {
  test('POST rejects missing catalogueItemId', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ serialNumber: 'VAL-001', gymId, purchaseDate: '2025-01-01' });
    expect(res.status).toBe(400);
  });

  test('POST rejects missing serialNumber', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, gymId, purchaseDate: '2025-01-01' });
    expect(res.status).toBe(400);
  });

  test('POST rejects missing gymId', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: 'VAL-003', purchaseDate: '2025-01-01' });
    expect(res.status).toBe(400);
  });

  test('POST rejects invalid status value', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: 'VAL-004', gymId, purchaseDate: '2025-01-01', status: 'invalid_status' });
    expect(res.status).toBe(400);
  });

  test('POST rejects negative purchase cost', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: 'VAL-005', gymId, purchaseDate: '2025-01-01', purchaseCost: -100 });
    expect(res.status).toBe(400);
  });

  test('POST rejects non-existent catalogue item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: '00000000-0000-0000-0000-000000000000', serialNumber: 'VAL-006', gymId, purchaseDate: '2025-01-01' });
    expect(res.status).toBe(404);
  });
});

describe('Equipment Inventory — Soft-Delete Edge Cases', () => {
  let deletedItemId: string;

  beforeAll(async () => {
    const item = await prisma.equipmentInventory.create({
      data: {
        tenantId,
        catalogueItemId: catalogueId,
        serialNumber: `DEL-EDGE-${testId}`,
        gymId,
        purchaseDate: new Date('2025-01-01'),
        maintenanceIntervalMonths: 6,
        nextMaintenanceAt: new Date('2025-07-01'),
        status: 'active',
        isActive: false,
        deletedAt: new Date(),
      },
    });
    deletedItemId = item.id;
  });

  test('GET :id returns 404 for soft-deleted item', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/inventory/${deletedItemId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH returns 404 for soft-deleted item', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/inventory/${deletedItemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ location: 'Somewhere' });
    expect(res.status).toBe(404);
  });

  test('POST /restore returns 404 for already-restored item', async () => {
    await prisma.equipmentInventory.update({
      where: { id: deletedItemId },
      data: { isActive: true, deletedAt: null },
    });
    const res = await request(app)
      .post(`/api/v1/equipment/inventory/${deletedItemId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);

    await prisma.equipmentInventory.update({
      where: { id: deletedItemId },
      data: { isActive: false, deletedAt: new Date() },
    });
  });
});

describe('Equipment Inventory — Duplicate Serial Number', () => {
  test('POST rejects duplicate serial number in same tenant', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-DUP-${testId}`, gymId, purchaseDate: '2025-05-01' });
    const id = body.data.id;

    const duplicate = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-DUP-${testId}`, gymId, purchaseDate: '2025-05-01' });
    expect(duplicate.status).toBe(409);

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });
});

describe('Equipment Inventory — Audit Logging', () => {
  test('creating an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_inventory', entityId: inventoryId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
  });

  test('updating an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_inventory', entityId: inventoryId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('UPDATE');
  });

  test('status change creates audit log with STATUS_CHANGE action', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-AUDIT-${testId}`, gymId, purchaseDate: '2025-06-01', status: 'ordered' });
    const id = body.data.id;

    await request(app)
      .patch(`/api/v1/equipment/inventory/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'delivered' });

    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_inventory', entityId: id, action: 'STATUS_CHANGE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('STATUS_CHANGE');

    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('deleting an item creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'equipment_inventory', entityId: inventoryId, action: 'DELETE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('DELETE');
  });
});

describe('Equipment Inventory — InventoryStatusLog Entries', () => {
  test('status change creates inventory status log entry', async () => {
    const statusLog = await prisma.inventoryStatusLog.findFirst({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
    });
    expect(statusLog).toBeTruthy();
    expect(statusLog!.tenantId).toBe(tenantId);
  });
});

describe('Equipment Inventory — Filtering & Query Params', () => {
  test('GET /api/v1/equipment/inventory filters by status', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-FILTER-${testId}`, gymId, purchaseDate: '2025-07-01', status: 'maintenance' });

    const res = await request(app)
      .get(`/api/v1/equipment/inventory?status=maintenance`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((i: any) => {
      expect(i.status).toBe('maintenance');
    });

    await request(app).delete(`/api/v1/equipment/inventory/${body.data.id}`).set('Authorization', `Bearer ${accessToken}`);
  });

  test('GET with includeInactive returns soft-deleted items', async () => {
    const { body } = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ catalogueItemId: catalogueId, serialNumber: `SN-INCLUDE-${testId}`, gymId, purchaseDate: '2025-08-01', status: 'active' });
    const id = body.data.id;
    await request(app).delete(`/api/v1/equipment/inventory/${id}`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app)
      .get('/api/v1/equipment/inventory?includeInactive=true')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const found = res.body.data.find((i: any) => i.id === id);
    expect(found).toBeTruthy();
    expect(found.isActive).toBe(false);
  });
});
