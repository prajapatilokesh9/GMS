import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../common/middleware/validate';
import { authenticate } from '../common/middleware/authenticate';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import rateLimit from 'express-rate-limit';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, please try again later' } },
});

router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => authController.refreshToken(req, res, next));
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', validate(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));
router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));

export default router;
