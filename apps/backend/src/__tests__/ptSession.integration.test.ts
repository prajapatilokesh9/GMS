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
let trainerId: string;
let clientUserId: string;
let sessionId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `PtSession Test Tenant B ${testId}`, slug: `ptsess-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('PT Session — Setup', () => {
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
      .send({ name: `PtSession Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });

  test('creates a trainer for session tests', async () => {
    const admin = await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } });
    const existing = await prisma.trainer.findFirst({ where: { userId: admin!.id, tenantId } });
    if (existing) {
      trainerId = existing.id;
    } else {
      const res = await request(app)
        .post('/api/v1/trainers')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ userId: admin!.id, gymId, specialization: 'Session Test Trainer' });
      expect(res.status).toBe(201);
      trainerId = res.body.data.id;
    }
  });

  test('creates a client user for session tests', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: `ptsess-client-${testId}@test.com`,
        password: 'test1234',
        firstName: 'Session',
        lastName: 'Client',
      });
    expect(res.status).toBe(201);
    clientUserId = res.body.data.id;
  });
});

describe('PT Session — CRUD', () => {
  test('POST /api/v1/pt-sessions creates a session', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: clientUserId,
        scheduledAt: new Date('2026-07-01T10:00:00Z').toISOString(),
        gymId,
        notes: 'Initial assessment session',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('scheduled');
    expect(res.body.data.trainerId).toBe(trainerId);
    expect(res.body.data.clientId).toBe(clientUserId);
    sessionId = res.body.data.id;
  });

  test('GET /api/v1/pt-sessions lists sessions', async () => {
    const res = await request(app)
      .get('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/pt-sessions/:id returns session details', async () => {
    const res = await request(app)
      .get(`/api/v1/pt-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(sessionId);
    expect(res.body.data.client.email).toContain('ptsess-client');
  });

  test('PATCH /api/v1/pt-sessions/:id updates session fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/pt-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ notes: 'Updated notes for session' });
    expect(res.status).toBe(200);
    expect(res.body.data.notes).toBe('Updated notes for session');
  });

  test('GET /api/v1/pt-sessions/:id returns 404 for non-existent session', async () => {
    const res = await request(app)
      .get('/api/v1/pt-sessions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('PT Session — Status Transitions', () => {
  test('POST /api/v1/pt-sessions/:id/check-in transitions to checked_in', async () => {
    const res = await request(app)
      .post(`/api/v1/pt-sessions/${sessionId}/check-in`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('checked_in');
    expect(res.body.data.startedAt).toBeTruthy();
  });

  test('POST /api/v1/pt-sessions/:id/check-in rejects already checked in', async () => {
    const res = await request(app)
      .post(`/api/v1/pt-sessions/${sessionId}/check-in`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(409);
  });

  test('POST /api/v1/pt-sessions/:id/complete transitions to completed', async () => {
    const res = await request(app)
      .post(`/api/v1/pt-sessions/${sessionId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.completedAt).toBeTruthy();
  });

  test('POST /api/v1/pt-sessions/:id/cancel creates a cancelled session', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: clientUserId,
        scheduledAt: new Date('2026-07-02T14:00:00Z').toISOString(),
      });
    expect(res.status).toBe(201);
    const cancelId = res.body.data.id;

    const cancelRes = await request(app)
      .post(`/api/v1/pt-sessions/${cancelId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('cancelled');
    expect(cancelRes.body.data.cancelledAt).toBeTruthy();
  });
});

describe('PT Session — RBAC & Authorization', () => {
  test('GET /api/v1/pt-sessions rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/pt-sessions');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/pt-sessions rejects without auth token', async () => {
    const res = await request(app).post('/api/v1/pt-sessions').send({ trainerId, clientId: clientUserId, scheduledAt: new Date().toISOString() });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/pt-sessions/:id rejects without auth token', async () => {
    const res = await request(app).get(`/api/v1/pt-sessions/${sessionId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/pt-sessions/:id rejects without auth token', async () => {
    const res = await request(app).patch(`/api/v1/pt-sessions/${sessionId}`).send({ notes: 'test' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/pt-sessions/:id/check-in rejects without auth token', async () => {
    const res = await request(app).post(`/api/v1/pt-sessions/${sessionId}/check-in`);
    expect(res.status).toBe(401);
  });
});

describe('PT Session — Multi-Tenancy', () => {
  let otherSessionId: string;

  test('creates a session in a different tenant', async () => {
    const otherUser = await prisma.user.create({
      data: {
        tenantId: secondTenantId,
        email: `other-ptsess-user-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Other',
        lastName: 'Session',
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
    const otherSession = await prisma.ptSession.create({
      data: {
        tenantId: secondTenantId,
        trainerId: otherTrainer.id,
        clientId: otherUser.id,
        gymId: otherGym.id,
        scheduledAt: new Date('2026-07-03T10:00:00Z'),
      },
    });
    otherSessionId = otherSession.id;
  });

  test('GET /api/v1/pt-sessions list does not leak cross-tenant sessions', async () => {
    const res = await request(app)
      .get('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((s: any) => s.id);
    expect(ids).not.toContain(otherSessionId);
  });

  test('GET /api/v1/pt-sessions/:id returns 404 for cross-tenant session', async () => {
    const res = await request(app)
      .get(`/api/v1/pt-sessions/${otherSessionId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/pt-sessions/:id rejects update of cross-tenant session', async () => {
    const res = await request(app)
      .patch(`/api/v1/pt-sessions/${otherSessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ notes: 'Hacked notes' });
    expect(res.status).toBe(404);
  });
});

describe('PT Session — Validation', () => {
  test('POST /api/v1/pt-sessions rejects missing trainerId', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ clientId: clientUserId, scheduledAt: new Date().toISOString() });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-sessions rejects missing clientId', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ trainerId, scheduledAt: new Date().toISOString() });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-sessions rejects missing scheduledAt', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ trainerId, clientId: clientUserId });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-sessions rejects invalid trainerId format', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ trainerId: 'not-a-uuid', clientId: clientUserId, scheduledAt: new Date().toISOString() });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/pt-sessions rejects non-existent trainerId', async () => {
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ trainerId: '00000000-0000-0000-0000-000000000000', clientId: clientUserId, scheduledAt: new Date().toISOString() });
    expect(res.status).toBe(404);
  });
});

describe('PT Session — Events', () => {
  test('creating a session publishes pt.session.created event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `ptsess-event-user-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Event',
        lastName: 'Session',
      },
    });
    const res = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: tempUser.id,
        scheduledAt: new Date('2026-07-04T10:00:00Z').toISOString(),
      });
    expect(res.status).toBe(201);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.session.created',
    }));
  });

  test('checking in publishes pt.session.started event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `ptsess-start-event-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Start',
        lastName: 'Event',
      },
    });
    const { body } = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: tempUser.id,
        scheduledAt: new Date('2026-07-05T10:00:00Z').toISOString(),
      });
    const newSessionId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .post(`/api/v1/pt-sessions/${newSessionId}/check-in`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.session.started',
    }));
  });

  test('completing publishes pt.session.completed event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `ptsess-complete-event-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Complete',
        lastName: 'Event',
      },
    });
    const { body } = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: tempUser.id,
        scheduledAt: new Date('2026-07-06T10:00:00Z').toISOString(),
      });
    const newSessionId = body.data.id;
    await request(app)
      .post(`/api/v1/pt-sessions/${newSessionId}/check-in`)
      .set('Authorization', `Bearer ${accessToken}`);
    mockPublishEvent.mockClear();

    await request(app)
      .post(`/api/v1/pt-sessions/${newSessionId}/complete`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.session.completed',
    }));
  });

  test('cancelling publishes pt.session.cancelled event', async () => {
    const tempUser = await prisma.user.create({
      data: {
        tenantId,
        email: `ptsess-cancel-event-${testId}@test.com`,
        passwordHash: (await prisma.user.findFirst({ where: { email: 'admin@fitcore.local' } }))!.passwordHash,
        firstName: 'Cancel',
        lastName: 'Event',
      },
    });
    const { body } = await request(app)
      .post('/api/v1/pt-sessions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        trainerId,
        clientId: tempUser.id,
        scheduledAt: new Date('2026-07-07T10:00:00Z').toISOString(),
      });
    const newSessionId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .post(`/api/v1/pt-sessions/${newSessionId}/cancel`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'pt.session.cancelled',
    }));
  });
});

describe('PT Session — Audit Logging', () => {
  test('creating a session creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'pt_session', entityId: sessionId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
  });
});
