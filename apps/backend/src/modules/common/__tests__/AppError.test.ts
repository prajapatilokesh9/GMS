import { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError } from '../errors/AppError';

describe('AppError', () => {
  it('should create a basic AppError with correct status and message', () => {
    const err = new AppError('Test error', 400, 'TEST_ERROR');
    expect(err.message).toBe('Test error');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.isOperational).toBe(true);
  });

  it('should create NotFoundError with correct defaults', () => {
    const err = new NotFoundError('User');
    expect(err.message).toBe('User not found');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  it('should create UnauthorizedError with default message', () => {
    const err = new UnauthorizedError();
    expect(err.message).toBe('Unauthorized');
    expect(err.statusCode).toBe(401);
  });

  it('should create ForbiddenError', () => {
    const err = new ForbiddenError('No access');
    expect(err.message).toBe('No access');
    expect(err.statusCode).toBe(403);
  });

  it('should create ConflictError', () => {
    const err = new ConflictError('Duplicate email');
    expect(err.message).toBe('Duplicate email');
    expect(err.statusCode).toBe(409);
  });

  it('should create ValidationError with details', () => {
    const details = [{ path: 'email', message: 'Invalid email' }];
    const err = new ValidationError('Validation failed', details);
    expect(err.message).toBe('Validation failed');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });

  it('should preserve prototype chain for instanceof checks', () => {
    const err = new NotFoundError('Test');
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(Error);
  });
});
