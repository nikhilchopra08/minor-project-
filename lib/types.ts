import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  role: 'USER' | 'DEALER' | 'ADMIN';
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: 'USER' | 'DEALER' | 'ADMIN';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}