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
let companyId: string;
let supplementId: string;
let orderId: string;

beforeAll(async () => {
  const tenant = await prisma.tenant.findFirst({ where: { slug: 'demo' } });
  tenantId = tenant!.id;

  const secondTenant = await prisma.tenant.create({
    data: { name: `Test Tenant B ${testId}`, slug: `test-tenant-b-${testId}` },
  });
  secondTenantId = secondTenant.id;
});

afterAll(async () => {
  await prisma.tenant.delete({ where: { id: secondTenantId } }).catch(() => {});
});

beforeEach(() => {
  mockPublishEvent.mockClear();
});

describe('Supplement — Setup', () => {
  test('POST /api/v1/auth/login succeeds for admin', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@fitcore.local', password: 'admin1234' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    accessToken = res.body.data.tokens.accessToken;
  });

  test('POST /api/v1/gyms creates test gym for supplement tests', async () => {
    const res = await request(app)
      .post('/api/v1/gyms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: `Supplement Test Gym ${testId}`, city: 'Mumbai' });
    expect(res.status).toBe(201);
    gymId = res.body.data.id;
  });
});

describe('Supplement — Companies CRUD', () => {
  const companySlug = `test-co-${testId}`;

  test('POST /api/v1/supplements/companies creates a supplement company', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Test Company ${testId}`,
        slug: companySlug,
        email: 'test@company.com',
        phone: '9999999999',
        city: 'Mumbai',
        state: 'Maharashtra',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`Test Company ${testId}`);
    expect(res.body.data.slug).toBe(companySlug);
    expect(res.body.data.isActive).toBe(true);
    companyId = res.body.data.id;
  });

  test('GET /api/v1/supplements/companies lists supplement companies', async () => {
    const res = await request(app)
      .get('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((c: any) => c.id === companyId)).toBe(true);
  });

  test('GET /api/v1/supplements/companies/:id returns company details with supplements', async () => {
    const res = await request(app)
      .get(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(`Test Company ${testId}`);
    expect(Array.isArray(res.body.data.supplements)).toBe(true);
  });

  test('PATCH /api/v1/supplements/companies/:id updates company fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ city: 'Pune', phone: '8888888888' });
    expect(res.status).toBe(200);
    expect(res.body.data.city).toBe('Pune');
    expect(res.body.data.phone).toBe('8888888888');
  });

  test('PATCH /api/v1/supplements/companies/:id deactivates a company', async () => {
    await request(app)
      .patch(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    const res = await request(app)
      .get(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.isActive).toBe(false);
    // Reactivate for subsequent tests
    await request(app)
      .patch(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true, city: 'Mumbai' });
  });

  test('GET /api/v1/supplements/companies/:id returns 404 for non-existent company', async () => {
    const res = await request(app)
      .get('/api/v1/supplements/companies/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/supplements/companies rejects duplicate slug', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Duplicate Co', slug: companySlug });
    expect(res.status).toBe(409);
  });
});

describe('Supplement — Supplements CRUD', () => {
  test('POST /api/v1/supplements creates a supplement', async () => {
    const res = await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyId,
        name: `Whey Protein ${testId}`,
        slug: `whey-protein-${testId}`,
        category: 'protein',
        description: 'Premium whey protein isolate',
        price: 1999,
        mrp: 2499,
        unit: 'kg',
        unitValue: '1',
        stock: 50,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(`Whey Protein ${testId}`);
    expect(res.body.data.stock).toBe(50);
    expect(Number(res.body.data.price)).toBe(1999);
    supplementId = res.body.data.id;
  });

  test('GET /api/v1/supplements lists supplements', async () => {
    const res = await request(app)
      .get('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((s: any) => s.id === supplementId)).toBe(true);
  });

  test('GET /api/v1/supplements/:id returns supplement details', async () => {
    const res = await request(app)
      .get(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(`Whey Protein ${testId}`);
    expect(res.body.data.company.id).toBe(companyId);
    expect(Number(res.body.data.price)).toBe(1999);
    expect(Number(res.body.data.mrp)).toBe(2499);
  });

  test('PATCH /api/v1/supplements/:id updates supplement fields', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ price: 1799, stock: 45 });
    expect(res.status).toBe(200);
    expect(Number(res.body.data.price)).toBe(1799);
    expect(res.body.data.stock).toBe(45);
  });

  test('PATCH /api/v1/supplements/:id deactivates a supplement', async () => {
    await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    const res = await request(app)
      .get(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.body.data.isActive).toBe(false);
    // Reactivate
    await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true, price: 1999, stock: 50 });
  });

  test('GET /api/v1/supplements/:id returns 404 for non-existent supplement', async () => {
    const res = await request(app)
      .get('/api/v1/supplements/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('POST /api/v1/supplements rejects with inactive company', async () => {
    await request(app)
      .patch(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false });
    const res = await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyId,
        name: `Fail Supplement ${testId}`,
        slug: `fail-supplement-${testId}`,
        category: 'test',
        price: 100,
        mrp: 200,
      });
    expect(res.status).toBe(409);
    // Reactivate company
    await request(app)
      .patch(`/api/v1/supplements/companies/${companyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: true });
  });
});

describe('Supplement — Orders CRUD & Status Transitions', () => {
  test('POST /api/v1/supplements/orders creates an order', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(2);
    expect(res.body.data.status).toBe('pending');
    expect(Number(res.body.data.totalAmount)).toBe(3998);
    orderId = res.body.data.id;
  });

  test('GET /api/v1/supplements/orders/:id returns order details', async () => {
    const res = await request(app)
      .get(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.supplement.id).toBe(supplementId);
  });

  test('GET /api/v1/supplements/orders lists orders', async () => {
    const res = await request(app)
      .get('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((o: any) => o.id === orderId)).toBe(true);
  });

  test('PATCH /api/v1/supplements/orders/:id transitions pending → confirmed', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
  });

  test('PATCH /api/v1/supplements/orders/:id transitions confirmed → shipped with tracking', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'shipped', trackingId: `TRACK-${testId}` });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('shipped');
    expect(res.body.data.trackingId).toBe(`TRACK-${testId}`);
  });

  test('PATCH /api/v1/supplements/orders/:id transitions shipped → delivered', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'delivered' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('delivered');
    expect(res.body.data.deliveredAt).toBeTruthy();
  });

  test('PATCH /api/v1/supplements/orders/:id rejects transition on already delivered order', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(409);
  });

  test('POST /api/v1/supplements/orders rejects insufficient stock', async () => {
    // Set stock to 0
    await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ stock: 0 });
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 1 });
    expect(res.status).toBe(409);
    // Restore stock
    await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ stock: 50 });
  });

  test('POST /api/v1/supplements/orders decrements stock', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 3 });
    expect(res.status).toBe(201);
    const suppRes = await request(app)
      .get(`/api/v1/supplements/${supplementId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(suppRes.body.data.stock).toBe(47);
  });

  test('POST /api/v1/supplements/orders/:id cancels a pending order', async () => {
    const { body } = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 1 });
    const newOrderId = body.data.id;
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${newOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'cancelled' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
    expect(res.body.data.cancelledAt).toBeTruthy();
  });
});

describe('Supplement — RBAC & Authorization', () => {
  test('GET /api/v1/supplements rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/supplements');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/supplements rejects without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/supplements')
      .send({ companyId, name: 'Unauthorized', slug: 'unauth', category: 'test', price: 100, mrp: 200 });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/supplements/companies rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/supplements/companies');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/supplements/companies rejects without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .send({ name: 'No Auth Co', slug: 'no-auth-co' });
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/supplements/orders rejects without auth token', async () => {
    const res = await request(app).get('/api/v1/supplements/orders');
    expect(res.status).toBe(401);
  });

  test('POST /api/v1/supplements/orders rejects without auth token', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .send({ gymId, supplementId, quantity: 1 });
    expect(res.status).toBe(401);
  });

  test('PATCH /api/v1/supplements/:id rejects without auth token', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/${supplementId}`)
      .send({ price: 500 });
    expect(res.status).toBe(401);
  });
});

describe('Supplement — Multi-Tenancy', () => {
  let otherCompanyId: string;

  test('creates a company in a different tenant', async () => {
    const otherCompany = await prisma.supplementCompany.create({
      data: {
        tenantId: secondTenantId,
        name: `Other Tenant Co ${testId}`,
        slug: `other-co-${testId}`,
      },
    });
    otherCompanyId = otherCompany.id;
  });

  test('GET /api/v1/supplements/companies list does not leak cross-tenant companies', async () => {
    const res = await request(app)
      .get('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`);
    const ids = res.body.data.map((c: any) => c.id);
    expect(ids).not.toContain(otherCompanyId);
  });

  test('GET /api/v1/supplements/companies/:id returns 404 for cross-tenant company', async () => {
    const res = await request(app)
      .get(`/api/v1/supplements/companies/${otherCompanyId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });

  test('PATCH /api/v1/supplements/companies/:id rejects update of cross-tenant company', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/companies/${otherCompanyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Hacked Name' });
    expect(res.status).toBe(404);
  });

  test('supplement created in second tenant is isolated', async () => {
    const otherSupplement = await prisma.supplement.create({
      data: {
        tenantId: secondTenantId,
        companyId: otherCompanyId,
        name: `Other Supplement ${testId}`,
        slug: `other-supp-${testId}`,
        category: 'test',
        price: 500,
        mrp: 600,
      },
    });
    const res = await request(app)
      .get(`/api/v1/supplements/${otherSupplement.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Supplement — Validation', () => {
  test('POST /api/v1/supplements/companies rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ slug: `no-name-${testId}` });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements/companies rejects missing slug', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'No Slug Co' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements rejects missing name', async () => {
    const res = await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ companyId, slug: `no-name-${testId}`, category: 'test', price: 100, mrp: 200 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements rejects negative price', async () => {
    const res = await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyId, name: 'Negative Price', slug: `neg-price-${testId}`,
        category: 'test', price: -100, mrp: 200,
      });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements rejects zero price', async () => {
    const res = await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyId, name: 'Zero Price', slug: `zero-price-${testId}`,
        category: 'test', price: 0, mrp: 200,
      });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements/orders rejects missing gymId', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ supplementId, quantity: 1 });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements/orders rejects negative quantity', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: -1 });
    expect(res.status).toBe(400);
  });

  test('PATCH /api/v1/supplements/orders/:id rejects invalid status', async () => {
    const res = await request(app)
      .patch(`/api/v1/supplements/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'invalid_status' });
    expect(res.status).toBe(400);
  });

  test('POST /api/v1/supplements/orders returns 404 for non-existent supplement', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId: '00000000-0000-0000-0000-000000000000', quantity: 1 });
    expect(res.status).toBe(404);
  });
});

describe('Supplement — Events', () => {
  test('creating a company publishes supplement.company.created event', async () => {
    const res = await request(app)
      .post('/api/v1/supplements/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: `Event Test Co ${testId}`,
        slug: `event-company-${testId}`,
      });
    expect(res.status).toBe(201);
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'supplement.company.created',
    }));
  });

  test('creating a supplement publishes supplement.created event', async () => {
    await request(app)
      .post('/api/v1/supplements')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        companyId,
        name: `Event Supplement ${testId}`,
        slug: `event-supplement-${testId}`,
        category: 'test',
        price: 500,
        mrp: 600,
      });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'supplement.created',
    }));
  });

  test('creating an order publishes supplement.order.created event', async () => {
    await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 1 });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'supplement.order.created',
    }));
  });

  test('updating an order publishes supplement.order.updated event', async () => {
    const { body } = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 1 });
    const newOrderId = body.data.id;
    mockPublishEvent.mockClear();

    await request(app)
      .patch(`/api/v1/supplements/orders/${newOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'confirmed' });
    expect(mockPublishEvent).toHaveBeenCalledWith('billing', expect.objectContaining({
      eventName: 'supplement.order.updated',
    }));
  });
});

describe('Supplement — Audit Logging', () => {
  test('creating a company creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement_company', entityId: companyId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
    expect(auditLog!.tenantId).toBe(tenantId);
    expect(auditLog!.description).toContain(`Test Company ${testId}`);
  });

  test('updating a company creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement_company', entityId: companyId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.description).toContain('Test Company');
  });

  test('creating a supplement creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement', entityId: supplementId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
  });

  test('updating a supplement creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement', entityId: supplementId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.description).toContain('Whey Protein');
  });

  test('creating an order creates audit log entry', async () => {
    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement_order', entityId: orderId, action: 'CREATE' },
      orderBy: { createdAt: 'asc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('CREATE');
  });

  test('updating an order creates audit log entry', async () => {
    const { body } = await request(app)
      .post('/api/v1/supplements/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ gymId, supplementId, quantity: 1 });
    const newOrderId = body.data.id;

    await request(app)
      .patch(`/api/v1/supplements/orders/${newOrderId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ status: 'confirmed' });

    const auditLog = await prisma.auditLog.findFirst({
      where: { entityType: 'supplement_order', entityId: newOrderId, action: 'UPDATE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(auditLog).toBeTruthy();
    expect(auditLog!.action).toBe('UPDATE');
  });
});
