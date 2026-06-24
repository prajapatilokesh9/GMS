import bcrypt from 'bcryptjs';
import { authConfig } from '../../../config/auth';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, authConfig.saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
