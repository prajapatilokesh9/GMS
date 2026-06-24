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
let packageId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `PtPackage Test Tenant B ${testId}`, slug: `ptpkg-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('PT Package — Setup', () => {
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
      .send({ name: `PtPackage Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });
});

describe('PT Package — CRUD', () => {
  test('POST /api/v1/pt-packages creates a package', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `10 Session Package ${testId}`,
        totalSessions: 10,
        price: 5000,
        validityDays: 30,
        gymId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`10 Session Package ${testId}`);
    expect(res.body.data.totalSessions).toBe(10);
    expect(res.body.data.price).toBe('5000');
    expect(res.body.data.validityDays).toBe(30);
    packageId = res.body.data.id;
  });

  test('GET /api/v1/pt-packages lists packages', async () => {
    const res = await request(app)
      .get('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/pt-packages/:id returns package details', async () => {
    const res = await request(app)
      .get(`/api/v1/pt-packages/${packageId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(packageId);
    expect(res.body.data.gym.name).toContain('PtPackage Test Gym');
  });

  test('PATCH /api/v1/pt-packages/:id updates package fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/pt-packages/${packageId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ price: 4500, totalSessions: 8 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe('4500');
    expect(res.body.data.totalSessions).toBe(8);
  });

  test('PATCH /api/v1/pt-packages/:id deactivates a package', async () => {
    const res = await request(app)
      .patch(`/api/v1/pt-packages/${packageId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    const reactivate = await request(app)
      .patch(`/api/v1/pt-packages/${packageId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true });
    expect(reactivate.status).toBe(200);
    expect(reactivate.body.data.isActive).toBe(true);
  });

  test('GET /api/v1/pt-packages/:id returns 404 for non-existent package', async () => {
    const res = await request(app)
      .get('/api/v1/pt-packages/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/pt-packages rejects duplicate name', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `10 Session Package ${testId}`,
        totalSessions: 5,
        price: 3000,
        validityDays: 30,
      });
    expect(res.status).toBe(409);
  });
});

describe('PT Package — RBAC & Authorization', () => {
  test('GET /api/v1/pt-packages rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/pt-packages');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/pt-packages rejects without auth token', async () => {
    const res = await request(app).post('/api/v1/pt-packages').send({ name: 'test', totalSessions: 5, price: 1000, validityDays: 30 });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/pt-packages/:id rejects without auth token', async () => {
    const res = await request(app).get(`/api/v1/pt-packages/${packageId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/pt-packages/:id rejects without auth token', async () => {
    const res = await request(app).patch(`/api/v1/pt-packages/${packageId}`).send({ price: 100 });
    expect(res.status).toBe(401);
  });
});

describe('PT Package — Multi-Tenancy', () => {
  let otherPackageId: string;

  test('creates a package in a different tenant', async () => {
    const otherPkg = await prisma.ptPackage.create({
      data: {
        tenantId: secondTenantId,
        name: `Other Tenant Pkg ${testId}`,
        totalSessions: 5,
        price: 2500,
        validityDays: 30,
      },
    });
    otherPackageId = otherPkg.id;
  });

  test('GET /api/v1/pt-packages list does not leak cross-tenant packages', async () => {
    const res = await request(app)
      .get('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((p: any) => p.id);
    expect(ids).not.toContain(otherPackageId);
  });

  test('GET /api/v1/pt-packages/:id returns 404 for cross-tenant package', async () => {
    const res = await request(app)
      .get(`/api/v1/pt-packages/${otherPackageId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/pt-packages/:id rejects update of cross-tenant package', async () => {
    const res = await request(app)
      .patch(`/api/v1/pt-packages/${otherPackageId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Hacked Package' });
    expect(res.status).toBe(404);
  });
});

describe('PT Package — Validation', () => {
  test('POST /api/v1/pt-packages rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ totalSessions: 5, price: 1000, validityDays: 30 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-packages rejects missing totalSessions', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Test', price: 1000, validityDays: 30 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-packages rejects negative price', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Neg Price ${testId}`, totalSessions: 5, price: -100, validityDays: 30 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-packages rejects zero totalSessions', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Zero Sessions ${testId}`, totalSessions: 0, price: 100, validityDays: 30 });
    expect(res.status).toBe(400);
  });
});

describe('PT Package — Events', () => {
  test('creating a package publishes pt.package.created event', async () => {
    const res = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Pkg ${testId}`,
        totalSessions: 5,
        price: 2500,
        validityDays: 30,
      });
    expect(res.status).toBe(201);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.package.created',
    }));
  });

  test('updating a package publishes pt.package.updated event', async () => {
    const { body } = await request(app)
      .post('/api/v1/pt-packages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Pkg Update ${testId}`,
        totalSessions: 5,
        price: 2500,
        validityDays: 30,
      });
    const newPkgId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/pt-packages/${newPkgId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ price: 2000 });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.package.updated',
    }));
  });
});

describe('PT Package — Audit Logging', () => {
  test('creating a package creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'pt_package', entityId: packageId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
  });

  test('updating a package creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'pt_package', entityId: packageId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('UPDATE');
  });
});
