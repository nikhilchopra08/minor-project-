import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DealerRegistrationState {
  currentStep: number;
  formData: {
    // Step 1: Personal Information
    email: string;
    password: string;
    confirmPassword: string;
    
    // Step 2: Business Information
    businessName: string;
    businessEmail: string;
    phone: string;
    gstNumber: string;
    
    // Step 3: Location Information
    address: string;
    city: string;
    state: string;
    
    // Step 4: Additional Details
    description: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: DealerRegistrationState = {
  currentStep: 1,
  formData: {
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessEmail: '',
    phone: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    description: '',
  },
  isLoading: false,
  error: null,
};

const dealerRegistrationSlice = createSlice({
  name: 'dealerRegistration',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<DealerRegistrationState['formData']>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetForm: (state) => {
      state.currentStep = 1;
      state.formData = initialState.formData;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setCurrentStep,
  updateFormData,
  setLoading,
  setError,
  resetForm,
} = dealerRegistrationSlice.actions;

export default dealerRegistrationSlice.reducer;