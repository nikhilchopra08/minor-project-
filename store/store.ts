import { configureStore } from '@reduxjs/toolkit';
import registerReducer from './registerSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    register: registerReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;