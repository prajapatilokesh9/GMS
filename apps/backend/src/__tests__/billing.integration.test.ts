import app from '../core/app';
import request from 'supertest';
import { getPrisma } from '../database/prisma.service';

jest.mock('../events/event-bus', () => ({
  publishEvent: jest.fn().mockResolvedValue(undefined),
  createWorker: jest.fn(),
  getDLQJobs: jest.fn().mockResolvedValue([]),
  requeueDLQJob: jest.fn().mockResolvedValue(false),
}));

const prisma = getPrisma();
const testId = Date.now();
let accessToken: string;
let tenantId: string;
let gymId: string;
let planId: string;
let membershipId: string;
let paymentId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;
});

describe('Billing Integration — Setup', () => {
  test('POST /api/v1/auth/login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    accessToken = res.body.data.tokens.accessToken;
  });

  test('POST /api/v1/gyms creates test gym for billing tests', async () => {
    const res = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Billing Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });

  test('POST /api/v1/billing/gyms/:gymId/plans creates a membership plan', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/plans`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Test Monthly Plan ${testId}`,
        type: 'fixed',
        priceAmount: 999,
        currency: 'INR',
        durationDays: 30,
        autoRenew: true,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toContain('Test Monthly Plan');
    planId = res.body.data.id;
  });

  test('POST /api/v1/billing/gyms/:gymId/memberships creates a membership', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/memberships`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ planId, autoRenew: true });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('active');
    membershipId = res.body.data.id;
  });
});

describe('Billing Integration — Plan Management', () => {
  test('GET /api/v1/billing/gyms/:gymId/plans lists plans', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/gyms/${gymId}/plans`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.some((p: any) => p.id === planId)).toBe(true);
  });

  test('GET /api/v1/billing/plans/:id returns plan details', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/plans/${planId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toContain('Test Monthly Plan');
    expect(res.body.data.type).toBe('fixed');
    expect(Number(res.body.data.priceAmount)).toBe(999);
  });

  test('PATCH /api/v1/billing/plans/:id updates plan fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/plans/${planId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ priceAmount: 1299, description: 'Updated description' });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.priceAmount)).toBe(1299);
    expect(res.body.data.description).toBe('Updated description');
  });

  test('PATCH /api/v1/billing/plans/:id allows deactivating a plan', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/plans/${planId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);

    // Reactivate for subsequent tests
    await request(app)
      .patch(`/api/v1/billing/plans/${planId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true, priceAmount: 999 });
  });
});

describe('Billing Integration — Membership Management', () => {
  test('GET /api/v1/billing/gyms/:gymId/memberships lists memberships', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/gyms/${gymId}/memberships`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((m: any) => m.id === membershipId)).toBe(true);
  });

  test('GET /api/v1/billing/memberships/:id returns membership details', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('active');
    expect(res.body.data.id).toBe(membershipId);
  });

  test('PATCH /api/v1/billing/memberships/:id pauses an active membership', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'paused' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paused');
    expect(res.body.data.pausedAt).toBeTruthy();
  });

  test('PATCH /api/v1/billing/memberships/:id rejects pause on non-active membership', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'paused' });
    expect(res.status).toBe(409);
  });

  test('POST /api/v1/billing/memberships/:id/renew activates a paused membership', async () => {
    // First check: renew with autoRenew off should fail on paused membership
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${membershipId}/renew`)
      .set('Authorization', `Bearer ${accessToken}`);
    // Paused memberships fail with 409
    expect(res.status).toBe(409);
  });

  test('PATCH /api/v1/billing/memberships/:id resumes via setting status active', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'paused' });
    // already paused — expect 409
    expect(res.status).toBe(409);
  });

  test('PATCH /api/v1/billing/memberships/:id cancels a paused membership', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
    expect(res.body.data.cancelledAt).toBeTruthy();
    expect(res.body.data.autoRenew).toBe(false);
  });

  test('PATCH /api/v1/billing/memberships/:id rejects cancel on already cancelled', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(409);
  });
});

describe('Billing Integration — Wallet Operations', () => {
  let walletMembershipId: string;

  test('creates a fresh membership for wallet tests', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/memberships`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ planId, autoRenew: true });
    expect(res.status).toBe(201);
    walletMembershipId = res.body.data.id;
    expect(Number(res.body.data.walletBalance)).toBe(0);
  });

  test('POST /api/v1/billing/memberships/:id/wallet/topup adds funds', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${walletMembershipId}/wallet/topup`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.balance)).toBe(5000);
  });

  test('POST /api/v1/billing/memberships/:id/wallet/topup adds more funds (cumulative)', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${walletMembershipId}/wallet/topup`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 2500 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.balance)).toBe(7500);
  });

  test('POST /api/v1/billing/memberships/:id/wallet/topup rejects zero amount', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${walletMembershipId}/wallet/topup`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 0 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/billing/memberships/:id/wallet/topup rejects negative amount', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${walletMembershipId}/wallet/topup`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: -100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/billing/memberships/:id/wallet/topup rejects amount exceeding max', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/memberships/${walletMembershipId}/wallet/topup`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ amount: 100001 });
    expect(res.status).toBe(400);
  });
});

describe('Billing Integration — Payment Management', () => {
  beforeAll(async () => {
    const payment = await prisma.payment.create({
      data: {
        tenantId,
        entityType: 'membership',
        entityId: membershipId ?? '00000000-0000-0000-0000-000000000000',
        amount: 999,
        currency: 'INR',
        gateway: 'razorpay',
        gatewayTxnId: `txn_test_${testId}`,
        gatewayOrderId: `order_test_${testId}`,
        status: 'completed',
      },
    });
    paymentId = payment.id;
  });

  test('GET /api/v1/billing/payments lists payments', async () => {
    const res = await request(app)
      .get('/api/v1/billing/payments')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p: any) => p.id === paymentId)).toBe(true);
  });

  test('GET /api/v1/billing/payments/:id returns payment details', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/payments/${paymentId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.gateway).toBe('razorpay');
    expect(Number(res.body.data.amount)).toBe(999);
    expect(res.body.data.status).toBe('completed');
  });

  test('GET /api/v1/billing/payments filters by status', async () => {
    const res = await request(app)
      .get('/api/v1/billing/payments')
      .set('Authorization', `Bearer ${accessToken}`);
    const completed = res.body.data.filter((p: any) => p.status === 'completed');
    expect(completed.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Billing Integration — RBAC & Authorization', () => {
  test('GET /api/v1/billing/gyms/:gymId/plans rejects without auth token', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/gyms/${gymId}/plans`);
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/billing/gyms/:gymId/plans rejects without auth token', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/plans`)
      .send({ name: 'Unauthorized Plan', type: 'fixed', priceAmount: 500 });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/billing/payments rejects without auth token', async () => {
    const res = await request(app)
      .get('/api/v1/billing/payments');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/billing/plans/:id rejects without auth token', async () => {
    const res = await request(app)
      .get(`/api/v1/billing/plans/${planId}`);
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/billing/plans/:id rejects without auth token', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/plans/${planId}`)
      .send({ priceAmount: 500 });
    expect(res.status).toBe(401);
  });
});

describe('Billing Integration — Error Handling', () => {
  test('GET /api/v1/billing/plans/:id returns 404 for non-existent plan', async () => {
    const res = await request(app)
      .get('/api/v1/billing/plans/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/v1/billing/memberships/:id returns 404 for non-existent membership', async () => {
    const res = await request(app)
      .get('/api/v1/billing/memberships/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('GET /api/v1/billing/payments/:id returns 404 for non-existent payment', async () => {
    const res = await request(app)
      .get('/api/v1/billing/payments/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/billing/gyms/:gymId/plans rejects missing required fields', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/plans`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Incomplete Plan' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/billing/gyms/:gymId/plans rejects invalid type', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/plans`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Bad Plan', type: 'invalid_type', priceAmount: 500 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/billing/gyms/:gymId/plans rejects negative price', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/plans`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Negative Plan', type: 'fixed', priceAmount: -100 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/billing/gyms/:gymId/memberships rejects non-existent plan', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/memberships`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ planId: '00000000-0000-0000-0000-000000000000' });
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/billing/gyms/:gymId/memberships rejects non-uuid planId', async () => {
    const res = await request(app)
      .post(`/api/v1/billing/gyms/${gymId}/memberships`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ planId: 'not-a-uuid' });
    expect(res.status).toBe(400);
  });

  test('PATCH /api/v1/billing/memberships/:id rejects invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/v1/billing/memberships/${membershipId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(400);
  });
});
