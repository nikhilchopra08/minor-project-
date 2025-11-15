import { NextRequest } from 'next/server';
import { verifyAccessToken } from './utils';
import { AuthUser } from './types';

export const authMiddleware = async (req: NextRequest): Promise<AuthUser | null> => {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role as 'USER' | 'DEALER' | 'ADMIN',
    };
  } catch (error) {
    return null;
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (user: AuthUser | null): boolean => {
    return user !== null && allowedRoles.includes(user.role);
  };
};