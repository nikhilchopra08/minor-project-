import { configureStore } from '@reduxjs/toolkit';
import registerReducer from './registerSlice';
import authReducer from './authSlice';
import bookingReducer from './bookingSlice'

export const store = configureStore({
  reducer: {
    register: registerReducer,
    auth: authReducer,
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;