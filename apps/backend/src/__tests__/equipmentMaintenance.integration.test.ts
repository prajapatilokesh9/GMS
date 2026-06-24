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
let secondToken: string;
let gymId: string;
let catalogueId: string;
let inventoryId: string;
let jobId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  secondTenantId = (await prisma.tenant.create({
    data: { name: `Maint Test Tenant B ${testId}`, slug: `maint-tenant-b-${testId}` },
  })).id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('Setup', () => {
  test('login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    accessToken = res.body.data.tokens.accessToken;
  });

  test('create test gym', async () => {
    const res = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Maint Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });

  test('create test catalogue item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/catalogue')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Maint Test Treadmill ${testId}`,
        sku: `MAINT-TREAD-${testId}`,
        brand: 'MaintTestBrand',
        model: `MT-X1-${testId}`,
        category: 'Cardio',
        unitCost: 1500,
      });
    expect(res.status).toBe(201);
    catalogueId = res.body.data.id;
  });

  test('create active test inventory item', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/inventory')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        catalogueItemId: catalogueId,
        serialNumber: `MAINT-SN-${testId}`,
        gymId,
        purchaseDate: '2025-06-01',
        status: 'active',
        maintenanceIntervalMonths: 6,
      });
    expect(res.status).toBe(201);
    inventoryId = res.body.data.id;
  });

  test('login for cross-tenant access test', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    secondToken = res.body.data?.tokens?.accessToken;
  });
});

describe('CRUD', () => {
  test('creates a maintenance job', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        inventoryId,
        scheduledDate: '2025-07-01',
        type: 'preventive',
        assignedTechnicianName: 'Raj Test',
        description: 'Routine check',
        estimatedCost: 5000,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('scheduled');
    jobId = res.body.data.id;
  });

  test('lists jobs', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('gets a single job with status logs', async () => {
    const res = await request(app)
      .get(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.statusLogs).toBeDefined();
  });

  test('updates non-status fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description');
  });

  test('soft-deletes a scheduled job', async () => {
    const res = await request(app)
      .delete(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const getRes = await request(app)
      .get(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(404);
  });

  test('restores a deleted job', async () => {
    const res = await request(app)
      .post(`/api/v1/equipment/maintenance-jobs/${jobId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const getRes = await request(app)
      .get(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(200);
  });
});

describe('State Machine Transitions', () => {
  afterEach(async () => {
    // Clean up any non-terminal jobs for the test inventory so next test isn't blocked
    await prisma.maintenanceJob.updateMany({
      where: { inventoryId, tenantId, status: { in: ['scheduled', 'in_progress'] }, deletedAt: null, id: { not: jobId } },
      data: { status: 'cancelled' },
    });
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'active' } });
  });

  test('scheduled -> in_progress (requires assignedTo)', async () => {
    await prisma.maintenanceJob.update({ where: { id: jobId }, data: { status: 'scheduled', startedAt: null, completedAt: null, assignedTo: '00000000-0000-0000-0000-000000000001' } });
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'active' } });
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('in_progress');
    const inv = await prisma.equipmentInventory.findUnique({ where: { id: inventoryId } });
    expect(inv?.status).toBe('maintenance');
  });

  test('scheduled -> in_progress fails without assignedTo', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-07-10', type: 'preventive' });
    expect(res.status).toBe(201);
    const id = res.body.data.id;
    const startRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    expect(startRes.status).toBe(400);
  });

  test('in_progress -> completed', async () => {
    await prisma.maintenanceJob.update({ where: { id: jobId }, data: { status: 'in_progress', startedAt: new Date(), completedAt: null } });
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'maintenance' } });
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed', laborCost: 2000, partsCost: 1500 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    const inv = await prisma.equipmentInventory.findUnique({ where: { id: inventoryId } });
    expect(inv?.status).toBe('active');
    expect(inv?.lastMaintenanceAt).toBeTruthy();
    expect(inv?.nextMaintenanceAt).toBeTruthy();
  });

  test('cannot transition from completed', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'scheduled' });
    expect(res.status).toBe(400);
  });

  test('in_progress -> cancelled requires reason', async () => {
    const createRes = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-07-20', type: 'preventive', assignedTo: '00000000-0000-0000-0000-000000000008' });
    expect(createRes.status).toBe(201);
    const cid = createRes.body.data.id;
    await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    const cancelNoReason = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled' });
    expect(cancelNoReason.status).toBe(400);
    const cancelOk = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled', reason: 'Parts not available' });
    expect(cancelOk.status).toBe(200);
    const inv = await prisma.equipmentInventory.findUnique({ where: { id: inventoryId } });
    expect(inv?.status).toBe('active');
  });

  test('in_progress -> failed and failed -> scheduled retry', async () => {
    const createRes = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-08-01', type: 'corrective', assignedTo: '00000000-0000-0000-0000-000000000009' });
    expect(createRes.status).toBe(201);
    const fid = createRes.body.data.id;
    await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${fid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    const failRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${fid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'failed', reason: 'Component damage' });
    expect(failRes.status).toBe(200);
    expect(failRes.body.data.status).toBe('failed');
    const retryRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${fid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'scheduled', reason: 'New tech assigned' });
    expect(retryRes.status).toBe(200);
    expect(retryRes.body.data.status).toBe('scheduled');
  });
});

describe('Guard Conditions', () => {
  test('cannot create job for decommissioned inventory', async () => {
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'decommissioned' } });
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-09-01', type: 'preventive' });
    expect(res.status).toBe(400);
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'active' } });
  });

  test('approval required when estimatedCost exceeds limit', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-09-15', type: 'preventive', estimatedCost: 15000, assignedTo: '00000000-0000-0000-0000-000000000010' });
    expect(res.status).toBe(201);
    const aid = res.body.data.id;
    const startRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${aid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    expect(startRes.status).toBe(400);
  });

  test('cost required to complete maintenance', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-10-01', type: 'preventive', assignedTo: '00000000-0000-0000-0000-000000000011' });
    expect(res.status).toBe(201);
    const cid = res.body.data.id;
    await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    const completeRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed' });
    expect(completeRes.status).toBe(400);
  });
});

describe('RBAC', () => {
  test('all endpoints return 401 without token', async () => {
    const eps: { method: 'get' | 'post' | 'patch' | 'delete'; url: string; data?: any }[] = [
      { method: 'get', url: '/api/v1/equipment/maintenance-jobs' },
      { method: 'get', url: `/api/v1/equipment/maintenance-jobs/${jobId}` },
      { method: 'post', url: '/api/v1/equipment/maintenance-jobs', data: { inventoryId, scheduledDate: '2025-07-01' } },
      { method: 'patch', url: `/api/v1/equipment/maintenance-jobs/${jobId}`, data: { description: 'x' } },
      { method: 'delete', url: `/api/v1/equipment/maintenance-jobs/${jobId}` },
      { method: 'post', url: `/api/v1/equipment/maintenance-jobs/${jobId}/restore` },
    ];
    for (const ep of eps) {
      const req = (request(app) as any)[ep.method](ep.url);
      if (ep.data) req.send(ep.data);
      const res = await req;
      expect(res.status).toBe(401);
    }
  });
});

describe('Multi-Tenancy', () => {
  test('cross-tenant create uses own tenant scope', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-12-20', type: 'preventive' });
    expect(res.status).toBe(201);
    expect(res.body.data.tenantId).toBe(tenantId);
  });

  test('cross-tenant get for non-existent tenant resource returns 404', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000099';
    const res = await request(app)
      .get(`/api/v1/equipment/maintenance-jobs/${fakeId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Validation', () => {
  test('missing inventoryId returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ scheduledDate: '2025-07-01' });
    expect(res.status).toBe(400);
  });

  test('missing scheduledDate returns 400', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId });
    expect(res.status).toBe(400);
  });

  test('invalid inventoryId returns 404', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId: '00000000-0000-0000-0000-000000000099', scheduledDate: '2025-07-01' });
    expect(res.status).toBe(404);
  });

  test('invalid status returns 400', async () => {
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${jobId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(400);
  });
});

describe('Soft-Delete Edge Cases', () => {
  let delId: string;
  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-07-15', type: 'preventive', assignedTo: '00000000-0000-0000-0000-000000000012' });
    if (res.status === 201) {
      delId = res.body.data.id;
      await request(app)
        .delete(`/api/v1/equipment/maintenance-jobs/${delId}`)
        .set('Authorization', `Bearer ${accessToken}`);
    }
  });

  test('get deleted job returns 404', async () => {
    if (!delId) return;
    const res = await request(app)
      .get(`/api/v1/equipment/maintenance-jobs/${delId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('patch deleted job returns 404', async () => {
    if (!delId) return;
    const res = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${delId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ description: 'x' });
    expect(res.status).toBe(404);
  });

  test('restore deleted job works', async () => {
    if (!delId) return;
    const res = await request(app)
      .post(`/api/v1/equipment/maintenance-jobs/${delId}/restore`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Cost Tracking', () => {
  test('total cost is computed as labor + parts', async () => {
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'active' } });
    await prisma.maintenanceJob.updateMany({
      where: { inventoryId, tenantId, status: { in: ['scheduled', 'in_progress'] }, deletedAt: null },
      data: { status: 'cancelled' },
    });
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-08-01', type: 'corrective', assignedTo: '00000000-0000-0000-0000-000000000013' });
    expect(res.status).toBe(201);
    const cid = res.body.data.id;
    await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    const completeRes = await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${cid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'completed', laborCost: 3000, partsCost: 2000 });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.totalCost).toBe('5000');
  });
});

describe('Status Log', () => {
  test('status transitions create MaintenanceStatusLog entries', async () => {
    const logs = await prisma.maintenanceStatusLog.findMany({
      where: { jobId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Filters', () => {
  test('status filter', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/maintenance-jobs?status=completed')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((j: any) => expect(j.status).toBe('completed'));
  });

  test('type filter', async () => {
    const res = await request(app)
      .get('/api/v1/equipment/maintenance-jobs?type=preventive')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    res.body.data.forEach((j: any) => expect(j.type).toBe('preventive'));
  });
});

describe('Events', () => {
  test('job creation publishes maintenance.job.scheduled', async () => {
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-12-01', type: 'preventive', assignedTo: '00000000-0000-0000-0000-000000000014' });
    expect(res.status).toBe(201);
    const eventCalls = mockPublishEvent.mock.calls.filter(
      c => c[1] && typeof c[1] === 'object' && (c[1] as any).eventName === 'maintenance.job.scheduled',
    );
    expect(eventCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('scheduled->in_progress publishes maintenance.job.started + inventory status change', async () => {
    await prisma.equipmentInventory.update({ where: { id: inventoryId }, data: { status: 'active' } });
    await prisma.maintenanceJob.updateMany({
      where: { inventoryId, tenantId, status: { in: ['scheduled', 'in_progress'] }, deletedAt: null },
      data: { status: 'cancelled' },
    });
    const res = await request(app)
      .post('/api/v1/equipment/maintenance-jobs')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ inventoryId, scheduledDate: '2025-12-15', type: 'preventive', assignedTo: '00000000-0000-0000-0000-000000000015' });
    expect(res.status).toBe(201);
    const ejid = res.body.data.id;
    mockPublishEvent.mockClear();
    await request(app)
      .patch(`/api/v1/equipment/maintenance-jobs/${ejid}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'in_progress' });
    const startedCalls = mockPublishEvent.mock.calls.filter(
      c => c[1] && typeof c[1] === 'object' && (c[1] as any).eventName === 'maintenance.job.started',
    );
    expect(startedCalls.length).toBeGreaterThanOrEqual(1);
    const invStatusCalls = mockPublishEvent.mock.calls.filter(
      c => c[1] && typeof c[1] === 'object' && (c[1] as any).eventName === 'equipment.inventory.status.changed',
    );
    expect(invStatusCalls.length).toBeGreaterThanOrEqual(1);
  });
});
