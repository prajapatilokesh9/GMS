import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { HttpStatusCode } from '../common/errors/HttpStatusCode';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(HttpStatusCode.CREATED).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(req.body, { ipAddress, userAgent });
      res.status(HttpStatusCode.OK).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refreshToken(req.body.refreshToken);
      res.status(HttpStatusCode.OK).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const { getPrisma } = await import('../../database/prisma.service');
      const prisma = getPrisma();
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }
      const { passwordHash, refreshToken, ...sanitized } = user;
      res.json({ success: true, data: sanitized });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
