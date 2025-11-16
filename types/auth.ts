export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}