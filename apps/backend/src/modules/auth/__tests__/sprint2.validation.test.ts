import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../auth.validation';

describe('Auth Validation — Sprint 2', () => {
  describe('forgotPasswordSchema', () => {
    it('should validate a valid email', () => {
      const result = forgotPasswordSchema.parse({ email: 'test@example.com' });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'not-an-email' })).toThrow();
    });

    it('should reject missing email', () => {
      expect(() => forgotPasswordSchema.parse({})).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid token and password', () => {
      const result = resetPasswordSchema.parse({ token: 'abc123', password: 'newpassword123' });
      expect(result.token).toBe('abc123');
      expect(result.password).toBe('newpassword123');
    });

    it('should reject short password', () => {
      expect(() => resetPasswordSchema.parse({ token: 'abc123', password: '123' })).toThrow();
    });

    it('should reject empty token', () => {
      expect(() => resetPasswordSchema.parse({ token: '', password: 'validpassword' })).toThrow();
    });
  });
});
