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
let userId: string;
let trainerId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `Trainer Test Tenant B ${testId}`, slug: `trainer-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('Trainer — Setup', () => {
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
      .send({ name: `Trainer Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });

  test('GET admin user id for trainer creation', async () => {
    const admin = await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } });
    expect(admin).toBeTruthy();
    userId = admin!.id;
  });
});

describe('Trainer — CRUD', () => {
  test('POST /api/v1/trainers creates a trainer', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        userId,
        gymId,
        specialization: 'Strength Training',
        bio: 'Certified strength coach with 5 years experience.',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.specialization).toBe('Strength Training');
    expect(res.body.data.userId).toBe(userId);
    expect(res.body.data.gymId).toBe(gymId);
    trainerId = res.body.data.id;
  });

  test('GET /api/v1/trainers lists trainers', async () => {
    const res = await request(app)
      .get('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/trainers/:id returns trainer details', async () => {
    const res = await request(app)
      .get(`/api/v1/trainers/${trainerId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(trainerId);
    expect(res.body.data.user.email).toBe('admin@fitcore.local');
    expect(res.body.data.gym.name).toContain('Trainer Test Gym');
  });

  test('PATCH /api/v1/trainers/:id updates trainer fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/trainers/${trainerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ specialization: 'Yoga & Pilates' });
    expect(res.status).toBe(200);
    expect(res.body.data.specialization).toBe('Yoga & Pilates');
  });

  test('PATCH /api/v1/trainers/:id deactivates a trainer', async () => {
    const res = await request(app)
      .patch(`/api/v1/trainers/${trainerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    const reactivate = await request(app)
      .patch(`/api/v1/trainers/${trainerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true });
    expect(reactivate.status).toBe(200);
    expect(reactivate.body.data.isActive).toBe(true);
  });

  test('GET /api/v1/trainers/:id returns 404 for non-existent trainer', async () => {
    const res = await request(app)
      .get('/api/v1/trainers/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/trainers rejects duplicate user', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId, gymId });
    expect(res.status).toBe(409);
  });
});

describe('Trainer — RBAC & Authorization', () => {
  test('GET /api/v1/trainers rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/trainers');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/trainers rejects without auth token', async () => {
    const res = await request(app).post('/api/v1/trainers').send({ userId, gymId });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/trainers/:id rejects without auth token', async () => {
    const res = await request(app).get(`/api/v1/trainers/${trainerId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/trainers/:id rejects without auth token', async () => {
    const res = await request(app).patch(`/api/v1/trainers/${trainerId}`).send({ specialization: 'test' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/trainers rejects without trainer:manage permission', async () => {
    const { body } = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    const token = body.data.tokens.accessToken;

    const role = await prisma.role.findFirst({
      where: { tenantId, slug: 'staff' },
    });
    await prisma.rolePermission.create({
      data: {
        roleId: role!.id,
        permissionId: (await prisma.permission.findUnique({ where: { name: 'supplement:read' } }))!.id,
      },
    }).catch(() => {});
    const staffUser = await prisma.user.create({
      data: {
        tenantId,
        email: `staff-no-perm-trainer-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'NoPerm',
        lastName: 'Trainer',
      },
    });
    await prisma.userRole.create({
      data: { userId: staffUser.id, roleId: role!.id, tenantId },
    }).catch(() => {});

    const staffLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: `staff-no-perm-trainer-${testId}@test.com`, password: 'admin1234' });
    expect(staffLogin.status).toBe(200);
    const staffToken = staffLogin.body.data.tokens.accessToken;

    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ userId, gymId });
    expect(res.status).toBe(403);
  });
});

describe('Trainer — Multi-Tenancy', () => {
  let otherTrainerId: string;

  test('creates a trainer in a different tenant', async () => {
    const otherUser = await prisma.user.create({
      data: {
        tenantId: secondTenantId,
        email: `other-trainer-user-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Other',
        lastName: 'Trainer',
      },
    });
    const otherGym = await prisma.gym.create({
      data: {
        tenantId: secondTenantId,
        ownerId: otherUser.id,
        name: `Other Gym ${testId}`,
        slug: `other-gym-${testId}`,
      },
    });
    const otherTrainer = await prisma.trainer.create({
      data: {
        tenantId: secondTenantId,
        userId: otherUser.id,
        gymId: otherGym.id,
        specialization: 'Other Training',
      },
    });
    otherTrainerId = otherTrainer.id;
  });

  test('GET /api/v1/trainers list does not leak cross-tenant trainers', async () => {
    const res = await request(app)
      .get('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((t: any) => t.id);
    expect(ids).not.toContain(otherTrainerId);
  });

  test('GET /api/v1/trainers/:id returns 404 for cross-tenant trainer', async () => {
    const res = await request(app)
      .get(`/api/v1/trainers/${otherTrainerId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/trainers/:id rejects update of cross-tenant trainer', async () => {
    const res = await request(app)
      .patch(`/api/v1/trainers/${otherTrainerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ specialization: 'Hacked' });
    expect(res.status).toBe(404);
  });
});

describe('Trainer — Validation', () => {
  test('POST /api/v1/trainers rejects missing userId', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/trainers rejects missing gymId', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/trainers rejects invalid userId format', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: 'not-a-uuid', gymId });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/trainers rejects non-existent userId', async () => {
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: '00000000-0000-0000-0000-000000000000', gymId });
    expect(res.status).toBe(404);
  });
});

describe('Trainer — Events', () => {
  test('creating a trainer publishes pt.trainer.created event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `trainer-event-user-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Event',
        lastName: 'Trainer',
      },
    });
    const res = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: tempUser.id, gymId, specialization: 'Event Testing' });
    expect(res.status).toBe(201);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.trainer.created',
    }));
  });

  test('updating a trainer publishes pt.trainer.updated event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `trainer-event-update-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'EventUpdate',
        lastName: 'Trainer',
      },
    });
    const { body } = await request(app)
      .post('/api/v1/trainers')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: tempUser.id, gymId });
    const newTrainerId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/trainers/${newTrainerId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ specialization: 'Updated Spec' });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.trainer.updated',
    }));
  });
});

describe('Trainer — Audit Logging', () => {
  test('creating a trainer creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'trainer', entityId: trainerId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
  });

  test('updating a trainer creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'trainer', entityId: trainerId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('UPDATE');
  });
});
