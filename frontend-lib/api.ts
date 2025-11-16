import { getStoredTokens, isTokenValid, clearStoredTokens } from './auth';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async refreshToken(): Promise<string | null> {
    const { refreshToken } = getStoredTokens();
    
    if (!refreshToken) {
      clearStoredTokens();
      return null;
    }

    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (result.success && result.data.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
        return result.data.accessToken;
      } else {
        clearStoredTokens();
        return null;
      }
    } catch (error) {
      clearStoredTokens();
      return null;
    }
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    let accessToken = getStoredTokens().accessToken;

    // // Check if access token is expired and refresh if needed
    // if (accessToken && !isTokenValid(accessToken)) {
    //   accessToken = await this.refreshToken();
    // }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  async get(url: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      clearStoredTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  }

  async post(url: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      clearStoredTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  }

  async put(url: string, data: any) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      clearStoredTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  }

  async delete(url: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}${url}`, {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      clearStoredTokens();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    return response;
  }
}

export const apiClient = new ApiClient();