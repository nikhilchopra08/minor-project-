import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookingState {
  serviceId: string;
  dealerId: string;
  scheduledDate: string;
  startTime: string;
  estimatedHours: number;
  location: string;
  contactPhone: string;
  contactEmail: string;
  specialNotes: string;
  isEditingContact: boolean;
}

const initialState: BookingState = {
  serviceId: '',
  dealerId: '',
  scheduledDate: '',
  startTime: '09:00',
  estimatedHours: 4,
  location: '',
  contactPhone: '',
  contactEmail: '',
  specialNotes: '',
  isEditingContact: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookingData: (state, action: PayloadAction<Partial<BookingState>>) => {
      return { ...state, ...action.payload };
    },
    setEditingContact: (state, action: PayloadAction<boolean>) => {
      state.isEditingContact = action.payload;
    },
    resetBooking: () => initialState,
  },
});

export const { setBookingData, setEditingContact, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;