// k6 test for FitCore Pro Phase 1 performance baseline
// Tests auth endpoints (login, register) and gym endpoints (create, list) under 50 concurrent users
// Target: p95 <500ms for auth, p95 <300ms for gym CRUD

import { check, sleep } from 'k6';
import http from 'k6/http';

// Configuration
export const options = {
  stages: [
    { duration: '2m', target: 50 }, // Ramp up to 50 users over 2 minutes
    { duration: '5m', target: 50 }, // Stay at 50 users for 5 minutes
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // General threshold
    http_req_failed: ['rate<0.1'], // Less than 10% failures
  },
};

// Test data
const baseUrl = __ENV.BASE_URL || 'http://localhost:4000/api/v1';
const testUser = {
  email: `k6-test-${Math.floor(Math.random() * 10000)}@test.fitcore.app`,
  password: 'TestPass123!',
  fullName: 'K6 Test User',
  phone: '9999999999',
};

// Helper function to generate random gym data
function generateGymData() {
  const gymNames = ['K6 Gym Alpha', 'K6 Gym Beta', 'K6 Gym Gamma', 'K6 Gym Delta', 'K6 Gym Epsilon'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  return {
    gymName: gymNames[Math.floor(Math.random() * gymNames.length)],
    email: `gym-${Math.floor(Math.random() * 10000)}@test.fitcore.app`,
    phone: Math.floor(Math.random() * 9000000000) + 1000000000,
    addressLine1: `${Math.floor(Math.random() * 999) + 1} Test Street`,
    city: cities[Math.floor(Math.random() * cities.length)],
    state: 'TS',
    country: 'IN',
    pincode: Math.floor(Math.random() * 900000) + 100000,
    licenseNumber: `LIC-${Math.floor(Math.random() * 10000)}`,
  };
}

export default function () {
  // Test 1: Auth - User Registration
  let response = http.post(`${baseUrl}/auth/register`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    'registration status is 201': (r) => r.status === 201,
    'registration response time <500ms': (r) => r.timings.duration < 500,
  });
  sleep(0.1);

  // Test 2: Auth - User Login
  response = http.post(`${baseUrl}/auth/login`, JSON.stringify({
    email: testUser.email,
    password: testUser.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    'login status is 200': (r) => r.status === 200,
    'login response time <500ms': (r) => r.timings.duration < 500,
  });

  // Extract access token for subsequent requests
  let accessToken = '';
  if (response.status === 200) {
    try {
      const data = JSON.parse(response.body as string);
      accessToken = data.data.accessToken;
    } catch (e) {
      // If parsing fails, continue without token (some endpoints may not require it)
    }
  }

  // Test 3: Gym - Create Gym (requires authentication)
  const gymData = generateGymData();
  const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

  response = http.post(`${baseUrl}/gyms`, JSON.stringify(gymData), {
    headers,
  });
  check(response, {
    'gym creation status is 201': (r) => r.status === 201,
    'gym creation response time <300ms': (r) => r.timings.duration < 300,
  });

  // Extract gym ID for subsequent operations
  let gymId = '';
  if (response.status === 201) {
    try {
      const data = JSON.parse(response.body as string);
      gymId = data.data.id;
    } catch (e) {
      // If parsing fails, continue without gymId
    }
  }

  // Test 4: Gym - List Gyms (requires authentication)
  response = http.get(`${baseUrl}/gyms?page=1&limit=10`, {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  });
  check(response, {
    'list gyms status is 200': (r) => r.status === 200,
    'list gyms response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 5: Auth - Get User Profile (requires authentication)
  response = http.get(`${baseUrl}/auth/me`, {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  });
  check(response, {
    'get profile status is 200': (r) => r.status === 200,
    'get profile response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 6: Auth - Change Password (requires authentication)
  response = http.put(`${baseUrl}/users/me/change-password`, JSON.stringify({
    oldPassword: testUser.password,
    newPassword: 'NewPass456!',
  }), {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
  });
  check(response, {
    'change password status is 200': (r) => r.status === 200,
    'change password response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 7: Auth - Login History (requires authentication)
  response = http.get(`${baseUrl}/auth/login-history?page=1&limit=10`, {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  });
  check(response, {
    'get login history status is 200': (r) => r.status === 200,
    'get login history response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 8: Auth - Get Roles (requires authentication)
  response = http.get(`${baseUrl}/roles`, {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  });
  check(response, {
    'get roles status is 200': (r) => r.status === 200,
    'get roles response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 9: Gym - My Gyms (requires authentication)
  response = http.get(`${baseUrl}/gyms/my`, {
    headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
  });
  check(response, {
    'get my gyms status is 200': (r) => r.status === 200,
    'get my gyms response time <300ms': (r) => r.timings.duration < 300,
  });

  // Test 10: Auth - Forgot Password
  response = http.post(`${baseUrl}/auth/forgot-password`, JSON.stringify({
    email: testUser.email,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  check(response, {
    'forgot password status is 200': (r) => r.status === 200,
    'forgot password response time <300ms': (r) => r.timings.duration < 300,
  });

  // Sleep to simulate realistic user behavior
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}
