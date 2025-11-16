import { verifyAccessToken, verifyRefreshToken } from '@/lib/utils';

export interface StoredTokens {
  accessToken: string | null;
  refreshToken: string | null;
  user: any | null;
}

export const getStoredTokens = (): StoredTokens => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }

  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  };
};

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = verifyAccessToken(token);
    return payload !== null;
  } catch {
    return false;
  }
};

export const isRefreshTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const payload = verifyRefreshToken(token);
    return payload !== null;
  } catch {
    return false;
  }
};

export const clearStoredTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};