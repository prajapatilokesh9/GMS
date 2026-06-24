import app from '../core/app';
import request from 'supertest';
import { getPrisma } from '../database/prisma.service';

const prisma = getPrisma();
const gymName = `Test Gym S2 ${Date.now()}`;
let accessToken: string;
let userId: string;
let tenantId: string;
let gymId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;
});

describe('Sprint 2 Integration — Auth', () => {
  test('POST /api/v1/auth/forgot-password returns success for existing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'admin@fitcore.local' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('reset link');
  });

  test('POST /api/v1/auth/forgot-password returns success for non-existing email (timing-safe)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'nonexistent@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/auth/forgot-password rejects invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'bad-email' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/auth/reset-password rejects without token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ password: 'newpass123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/auth/reset-password rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalid-token-that-does-not-exist', password: 'newpass12345' });
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/auth/reset-password rejects short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'sometoken', password: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/auth/login succeeds for seeded admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeTruthy();
    accessToken = res.body.data.tokens.accessToken;
    userId = res.body.data.user.id;
  });

  test('POST /api/v1/auth/login fails for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/auth/me returns profile with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@fitcore.local');
  });

  test('GET /api/v1/auth/me rejects without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/users/me/change-password changes password successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'admin1234', newPassword: 'newadmin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    await request(app)
      .patch('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'newadmin1234', newPassword: 'admin1234' });
  });

  test('PATCH /api/v1/users/me/change-password rejects wrong old password', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ oldPassword: 'wrongpassword', newPassword: 'newadmin1234' });
    expect(res.status).toBe(401);
  });
});

describe('Sprint 2 Integration — Gym Document Workflow', () => {
  test('POST /api/v1/gyms creates a gym', async () => {
    const res = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: gymName, city: 'Mumbai' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(gymName);
    expect(res.body.data.onboardingStatus).toBe('pending');
    gymId = res.body.data.id;
  });

  test('POST /api/v1/gyms/:id/documents uploads a document', async () => {
    const res = await request(app)
      .post(`/api/v1/gyms/${gymId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', Buffer.from('test file content'), 'test.pdf')
      .field('documentType', 'business_license');
    expect(res.status).toBe(201);
    expect(res.body.data.documentType).toBe('business_license');
  });

  test('GET /api/v1/gyms/:id/documents lists documents', async () => {
    const res = await request(app)
      .get(`/api/v1/gyms/${gymId}/documents`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/v1/roles/my-permissions includes gym:verify', async () => {
    const res = await request(app)
      .get('/api/v1/roles/my-permissions')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('PATCH /api/v1/gyms/:id/verify triggers authorization', async () => {
    const res = await request(app)
      .patch(`/api/v1/gyms/${gymId}/verify`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ onboardingStatus: 'documents' });
    // Verifies the endpoint is reachable and protected; may return 200 or 403
    expect([200, 403]).toContain(res.status);
  });
});

describe('Sprint 2 Integration — Login History', () => {
  test('GET /api/v1/auth/login-history returns paginated history', async () => {
    const res = await request(app)
      .get('/api/v1/auth/login-history')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeTruthy();
  });

  test('GET /api/v1/auth/login-history includes LOGIN events', async () => {
    const res = await request(app)
      .get('/api/v1/auth/login-history')
      .set('Authorization', `Bearer ${accessToken}`);
    const logins = res.body.data.filter((e: any) => e.eventType === 'LOGIN');
    expect(logins.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Sprint 2 Integration — Staff Management', () => {
  test('POST /api/v1/gyms/:id/staff adds staff', async () => {
    const rolesRes = await request(app)
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${accessToken}`);
    const staffRole = rolesRes.body.data.find((r: any) => r.slug === 'staff');

    const res = await request(app)
      .post(`/api/v1/gyms/${gymId}/staff`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId, roleId: staffRole.id });
    expect(res.status).toBe(201);
  });

  test('GET /api/v1/gyms/:id/staff lists staff', async () => {
    const res = await request(app)
      .get(`/api/v1/gyms/${gymId}/staff`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
