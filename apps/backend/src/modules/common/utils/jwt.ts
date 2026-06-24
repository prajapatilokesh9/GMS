import jwt from 'jsonwebtoken';
import { authConfig } from '../../../config/auth';
import type { JwtPayload } from '../middleware/authenticate';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokenPair(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(
    payload as object,
    authConfig.accessSecret,
    { expiresIn: authConfig.accessExpiresIn } as any,
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId, tenantId: payload.tenantId },
    authConfig.refreshSecret,
    { expiresIn: authConfig.refreshExpiresIn } as any,
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): { userId: string; tenantId: string } {
  return jwt.verify(token, authConfig.refreshSecret) as { userId: string; tenantId: string };
}
