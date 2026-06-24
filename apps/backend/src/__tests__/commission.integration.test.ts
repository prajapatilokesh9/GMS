import request from 'supertest';
import app from '../core/app';
import { getPrisma } from '../database/prisma.service';
import { closeQueues } from '../events/event-bus';

jest.mock('../events/event-bus', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
  createWorker: jest.fn(),
  publishEventToQueue: jest.fn(),
  getDLQJobs: jest.fn().mockResolvedValue([]),
  requeueDLQJob: jest.fn(),
  listQueues: jest.fn().mockResolvedValue([]),
  closeQueues: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../config/redis', () => ({
  getRedis: jest.fn(() => ({
    status: 'ready',
    on: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined),
  })),
}));

let prisma: ReturnType<typeof getPrisma>;
let accessToken: string;
let otherToken: string;
let gymId: string;
let trainerId: string;
let otherGymId: string;
let ruleId: string;
let payoutId: string;
let sessionId: string;
let adminUserId: string;
let otherTenantId: string;

const API_BASE = '/api/v1';

async function loginAs(email: string, password: string) {
  const res = await request(app).post(`${API_BASE}/auth/login`).send({ email, password });
  return res.body.data.tokens.accessToken;
}

const TS = Date.now();

beforeAll(async () => {
  prisma = getPrisma();
  accessToken = await loginAs('admin@fitcore.local', 'admin1234');
  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } });
  adminUserId = adminUser!.id;
  const otherTenant = await prisma.tenant.findFirst({ where: { slug: 'pilot-partner' } });
  otherTenantId = otherTenant!.id;

  // Clean up stale commission test data
  const staleGyms = await prisma.gym.findMany({ where: { name: { startsWith: 'Commission Test' } } });
  for (const g of staleGyms) {
    await prisma.ptSession.deleteMany({ where: { gymId: g.id } }).catch(() => {});
    await prisma.trainer.deleteMany({ where: { gymId: g.id } }).catch(() => {});
    await prisma.gym.delete({ where: { id: g.id } }).catch(() => {});
  }

  // Create test gym
  const gymRes = await request(app).post(`${API_BASE}/gyms`).set('Authorization', `Bearer ${accessToken}`).send({
    name: `Commission Test Gym ${TS}`, ownerId: adminUserId,
    addressLine1: '123 Test St', city: 'Test City', state: 'Test State', pincode: '400001',
  });
  gymId = gymRes.body.data.id;

  const otherGymRes = await request(app).post(`${API_BASE}/gyms`).set('Authorization', `Bearer ${accessToken}`).send({
    name: `Commission Other Gym ${TS}`, ownerId: adminUserId,
    addressLine1: '456 Other St', city: 'Test City', state: 'Test State', pincode: '400001',
  });
  otherGymId = otherGymRes.body.data.id;

  // Create or reuse trainer
  let trainerRes = await request(app).post(`${API_BASE}/trainers`).set('Authorization', `Bearer ${accessToken}`).send({
    userId: adminUserId, gymId, specialization: 'Commission Testing', bio: 'Test trainer for commissions',
  });
  trainerId = trainerRes.status === 201 ? trainerRes.body.data.id : (await prisma.trainer.findFirst({ where: { userId: adminUserId } }))!.id;

  // Create completed session for payout tests
  const userRes = await request(app).post(`${API_BASE}/users`).set('Authorization', `Bearer ${accessToken}`).send({
    email: `commission-client-${Date.now()}@test.com`, password: 'test1234', firstName: 'Client', lastName: 'User',
    phone: `99999${String(Date.now()).slice(-5)}`,
  });
  const clientId = userRes.body.data.id;

  const sessionRes = await request(app).post(`${API_BASE}/pt-sessions`).set('Authorization', `Bearer ${accessToken}`).send({
    trainerId, clientId, scheduledAt: new Date().toISOString(), gymId,
  });
  sessionId = sessionRes.body.data.id;
  await request(app).post(`${API_BASE}/pt-sessions/${sessionId}/check-in`).set('Authorization', `Bearer ${accessToken}`);
  await request(app).post(`${API_BASE}/pt-sessions/${sessionId}/complete`).set('Authorization', `Bearer ${accessToken}`);
});

afterAll(async () => {
  await closeQueues();
});

describe('Commission Rules — Setup', () => {
  test('POST /api/v1/auth/login succeeds for admin', () => {
    expect(accessToken).toBeTruthy();
  });
  test('creates a test gym', () => {
    expect(gymId).toBeTruthy();
  });
  test('creates a trainer for commission tests', () => {
    expect(trainerId).toBeTruthy();
  });
});

describe('Commission Rules — CRUD', () => {
  test('POST /api/v1/commissions/rules creates a percentage rule', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, commissionType: 'percentage', commissionValue: 10, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
    expect(res.body.data.commissionType).toBe('percentage');
    expect(Number(res.body.data.commissionValue)).toBe(10);
    expect(res.body.data.status).toBe('active');
    ruleId = res.body.data.id;
  });

  test('POST /api/v1/commissions/rules creates a fixed rule', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, trainerId, commissionType: 'fixed', commissionValue: 500, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
    expect(res.body.data.commissionType).toBe('fixed');
    expect(Number(res.body.data.commissionValue)).toBe(500);
  });

  test('GET /api/v1/commissions/rules lists rules', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  test('GET /api/v1/commissions/rules/:id returns rule details', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules/${ruleId}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ruleId);
  });

  test('GET /api/v1/commissions/rules/:id returns 404 for non-existent', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules/00000000-0000-0000-0000-000000000000`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/commissions/rules/:id updates rule', async () => {
    const res = await request(app).patch(`${API_BASE}/commissions/rules/${ruleId}`).set('Authorization', `Bearer ${accessToken}`).send({ commissionValue: 15 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.commissionValue)).toBe(15);
  });
});

describe('Commission Rules — Status', () => {
  test('POST /api/v1/commissions/rules/:id/deactivate deactivates rule', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules/${ruleId}/deactivate`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });

  test('POST /api/v1/commissions/rules/:id/activate activates rule', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules/${ruleId}/activate`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
  });
});

describe('Commission Rules — RBAC', () => {
  test('GET /api/v1/commissions/rules rejects without auth token', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules`);
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/commissions/rules rejects without auth token', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).send({ gymId, commissionType: 'fixed', commissionValue: 100, effectiveFrom: new Date().toISOString() });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/commissions/rules/:id rejects without auth token', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules/${ruleId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/commissions/rules/:id rejects without auth token', async () => {
    const res = await request(app).patch(`${API_BASE}/commissions/rules/${ruleId}`).send({ commissionValue: 20 });
    expect(res.status).toBe(401);
  });
});

describe('Commission Rules — Multi-Tenancy', () => {
  beforeAll(async () => {
    const otherGymOwnerRole = await prisma.role.findFirst({ where: { tenantId: otherTenantId, slug: 'gym_owner' } });
    if (otherGymOwnerRole) {
      const commPerms = await prisma.permission.findMany({ where: { name: { in: ['commission:read', 'commission:manage'] } } });
      for (const perm of commPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: otherGymOwnerRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: otherGymOwnerRole.id, permissionId: perm.id },
        });
      }
    }
  });

  test('creates a rule in a different tenant', async () => {
    const otherTenantUser = await prisma.user.findFirst({ where: { tenantId: otherTenantId } });
    const pwd = otherTenantUser?.email === 'owner-rejected@fitcore.local' ? 'gymowner3' : 'admin1234';
    otherToken = await loginAs(otherTenantUser!.email, pwd);
    const otherGym = await prisma.gym.findFirst({ where: { tenantId: otherTenantId } });
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${otherToken}`).send({
      gymId: otherGym!.id, commissionType: 'fixed', commissionValue: 200, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/commissions/rules list does not leak cross-tenant rules', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    for (const rule of res.body.data) {
      expect(rule.gym?.name).not.toBe('Demo Rejected Gym');
    }
  });

  test('GET /api/v1/commissions/rules/:id returns 404 for cross-tenant rule', async () => {
    const otherRule = await prisma.commissionRule.findFirst({ where: { tenantId: otherTenantId } });
    const res = await request(app).get(`${API_BASE}/commissions/rules/${otherRule!.id}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Commission Rules — Validation', () => {
  test('POST /api/v1/commissions/rules rejects missing gymId', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      commissionType: 'fixed', commissionValue: 100, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/commissions/rules rejects invalid commissionType', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, commissionType: 'invalid', commissionValue: 100, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/commissions/rules rejects negative commissionValue', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, commissionType: 'fixed', commissionValue: -10, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/commissions/rules rejects non-existent gymId', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId: '00000000-0000-0000-0000-000000000000', commissionType: 'fixed', commissionValue: 100, effectiveFrom: new Date().toISOString(),
    });
    expect(res.status).toBe(404);
  });
});

describe('Commission Payouts — Calculation', () => {
  test('generates payout with fixed commission rule', async () => {
    // Create a fixed rule for this trainer
    const ruleRes = await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, trainerId, commissionType: 'fixed', commissionValue: 300, effectiveFrom: new Date(Date.now() - 86400000).toISOString(),
    });
    expect(ruleRes.status).toBe(201);

    const res = await request(app).post(`${API_BASE}/commissions/payouts/generate`).set('Authorization', `Bearer ${accessToken}`).send({
      sessionId, grossAmount: 1500,
    });
    expect(res.status).toBe(201);
    expect(Number(res.body.data.commissionAmount)).toBe(300);
    expect(res.body.data.payoutStatus).toBe('pending');
    payoutId = res.body.data.id;
  });

  test('generates payout with percentage commission rule (precedence)', async () => {
    // Create a percentage gym-wide rule — but trainer-specific should take precedence
    await request(app).post(`${API_BASE}/commissions/rules`).set('Authorization', `Bearer ${accessToken}`).send({
      gymId, commissionType: 'percentage', commissionValue: 20, effectiveFrom: new Date(Date.now() - 86400000).toISOString(),
    });
    // Create a new session to test with
    const userRes = await request(app).post(`${API_BASE}/users`).set('Authorization', `Bearer ${accessToken}`).send({
      email: `commission-client-2-${Date.now()}@test.com`, password: 'test1234', firstName: 'Client2', lastName: 'User',
      phone: `99998${String(Date.now()).slice(-5)}`,
    });
    const clientId2 = userRes.body.data.id;
    const sessRes = await request(app).post(`${API_BASE}/pt-sessions`).set('Authorization', `Bearer ${accessToken}`).send({
      trainerId, clientId: clientId2, scheduledAt: new Date().toISOString(), gymId,
    });
    const sessId2 = sessRes.body.data.id;
    await request(app).post(`${API_BASE}/pt-sessions/${sessId2}/check-in`).set('Authorization', `Bearer ${accessToken}`);
    await request(app).post(`${API_BASE}/pt-sessions/${sessId2}/complete`).set('Authorization', `Bearer ${accessToken}`);

    const res = await request(app).post(`${API_BASE}/commissions/payouts/generate`).set('Authorization', `Bearer ${accessToken}`).send({
      sessionId: sessId2, grossAmount: 1000,
    });
    expect(res.status).toBe(201);
    // Trainer-specific fixed (300) should take precedence over gym-wide percentage (20%)
    expect(Number(res.body.data.commissionAmount)).toBe(300);
  });

  test('duplicate generation returns 409', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/payouts/generate`).set('Authorization', `Bearer ${accessToken}`).send({
      sessionId, grossAmount: 1500,
    });
    expect(res.status).toBe(409);
  });

  test('generation for non-completed session returns 409', async () => {
    const userRes = await request(app).post(`${API_BASE}/users`).set('Authorization', `Bearer ${accessToken}`).send({
      email: `commission-client-3-${Date.now()}@test.com`, password: 'test1234', firstName: 'Client3', lastName: 'User',
      phone: `99997${String(Date.now()).slice(-5)}`,
    });
    const clientId3 = userRes.body.data.id;
    const sessRes = await request(app).post(`${API_BASE}/pt-sessions`).set('Authorization', `Bearer ${accessToken}`).send({
      trainerId, clientId: clientId3, scheduledAt: new Date().toISOString(), gymId,
    });
    const res = await request(app).post(`${API_BASE}/commissions/payouts/generate`).set('Authorization', `Bearer ${accessToken}`).send({
      sessionId: sessRes.body.data.id, grossAmount: 1000,
    });
    expect(res.status).toBe(409);
  });
});

describe('Commission Payouts — Status Lifecycle', () => {
  test('GET /api/v1/commissions/payouts lists payouts', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/payouts`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/v1/commissions/payouts/:id returns payout details', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/payouts/${payoutId}`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(payoutId);
  });

  test('POST /api/v1/commissions/payouts/:id/approve transitions to approved', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/payouts/${payoutId}/approve`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.payoutStatus).toBe('approved');
  });

  test('POST /api/v1/commissions/payouts/:id/mark-paid transitions to paid', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/payouts/${payoutId}/mark-paid`).set('Authorization', `Bearer ${accessToken}`).send({
      paymentReference: 'TRANS-001',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.payoutStatus).toBe('paid');
    expect(res.body.data.paymentReference).toBe('TRANS-001');
  });

  test('approving already paid payout returns 409', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/payouts/${payoutId}/approve`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(409);
  });
});

describe('Commission Payouts — RBAC', () => {
  test('GET /api/v1/commissions/payouts rejects without auth token', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/payouts`);
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/commissions/payouts/generate rejects without auth token', async () => {
    const res = await request(app).post(`${API_BASE}/commissions/payouts/generate`).send({ sessionId, grossAmount: 1000 });
    expect(res.status).toBe(401);
  });
});

describe('Commission Payouts — Multi-Tenancy', () => {
  test('GET /api/v1/commissions/payouts list does not leak cross-tenant payouts', async () => {
    const res = await request(app).get(`${API_BASE}/commissions/payouts`).set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    for (const payout of res.body.data) {
      expect(payout.trainer.user.email).not.toBe('owner-rejected@fitcore.local');
    }
  });

  test('GET /api/v1/commissions/payouts/:id returns 404 for cross-tenant payout', async () => {
    const otherPayout = await prisma.commissionPayout.findFirst({ where: { tenantId: otherTenantId } });
    if (otherPayout) {
      const res = await request(app).get(`${API_BASE}/commissions/payouts/${otherPayout.id}`).set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    }
  });
});

describe('Commission Payouts — Events', () => {
  test('generating payout publishes pt.commission.generated event', async () => {
    const { publishEvent } = require('../events/event-bus');
    expect(publishEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ eventName: 'pt.commission.generated' }),
    );
  });

  test('approving payout publishes pt.commission.approved event', async () => {
    const { publishEvent } = require('../events/event-bus');
    expect(publishEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ eventName: 'pt.commission.approved' }),
    );
  });

  test('marking paid publishes pt.commission.paid event', async () => {
    const { publishEvent } = require('../events/event-bus');
    expect(publishEvent).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ eventName: 'pt.commission.paid' }),
    );
  });
});

describe('Commission — Audit Logging', () => {
  test('creating a commission rule creates audit log entry', async () => {
    const logs = await prisma.auditLog.findMany({ where: { entityType: 'commission_rule', action: 'CREATE' } });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  test('generating a payout creates audit log entry', async () => {
    const logs = await prisma.auditLog.findMany({ where: { entityType: 'commission_payout', action: 'CREATE' } });
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });
});
