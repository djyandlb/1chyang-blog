// src/lib/auth.ts — JWT 认证
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'yibuchuanyang-jwt-secret-2026';
const CREDENTIALS = {
  username: '1chyang',
  passwordHash: bcrypt.hashSync('8gefuhao', 10),
};

export interface JwtPayload {
  username: string;
  iat: number;
  exp: number;
}

/** 验证用户名密码 */
export function verifyPassword(username: string, password: string): boolean {
  if (username !== CREDENTIALS.username) return false;
  return bcrypt.compareSync(password, CREDENTIALS.passwordHash);
}

/** 签发 JWT */
export function generateToken(username: string): string {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
}

/** 验证 JWT */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
