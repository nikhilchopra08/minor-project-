import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginFormData } from '@/types/auth';

// Check if we're in browser environment and get stored tokens
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      return {
        user: JSON.parse(storedUser),
        isLoading: false,
        error: null,
        isAuthenticated: true,
      };
    }
  }
  
  return {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken?: string }>) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  updateTokens,
} = authSlice.actions;

export default authSlice.reducer;