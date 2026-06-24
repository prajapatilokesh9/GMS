import { registerSchema, loginSchema, refreshTokenSchema } from '../auth.validation';

describe('registerSchema', () => {
  it('should validate a valid registration payload', () => {
    const result = registerSchema.parse({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    });
    expect(result.email).toBe('test@example.com');
    expect(result.firstName).toBe('John');
  });

  it('should reject invalid email', () => {
    expect(() =>
      registerSchema.parse({ email: 'invalid', password: 'password123', firstName: 'John', lastName: 'Doe' }),
    ).toThrow();
  });

  it('should reject short password', () => {
    expect(() =>
      registerSchema.parse({ email: 'test@test.com', password: '123', firstName: 'John', lastName: 'Doe' }),
    ).toThrow();
  });

  it('should reject missing firstName', () => {
    expect(() =>
      registerSchema.parse({ email: 'test@test.com', password: 'password123', lastName: 'Doe' }),
    ).toThrow();
  });
});

describe('loginSchema', () => {
  it('should validate a valid login payload', () => {
    const result = loginSchema.parse({ email: 'test@test.com', password: 'password123' });
    expect(result.email).toBe('test@test.com');
  });

  it('should reject empty password', () => {
    expect(() => loginSchema.parse({ email: 'test@test.com', password: '' })).toThrow();
  });
});

describe('refreshTokenSchema', () => {
  it('should validate a valid refresh token payload', () => {
    const result = refreshTokenSchema.parse({ refreshToken: 'some-token' });
    expect(result.refreshToken).toBe('some-token');
  });

  it('should reject empty token', () => {
    expect(() => refreshTokenSchema.parse({ refreshToken: '' })).toThrow();
  });
});
