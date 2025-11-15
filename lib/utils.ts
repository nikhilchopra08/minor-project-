import jwt from 'jsonwebtoken';
import { CustomJwtPayload } from './types';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const generateAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): CustomJwtPayload => {
  return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
};

export const verifyRefreshToken = (token: string): CustomJwtPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as CustomJwtPayload;
};