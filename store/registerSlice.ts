import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RegisterState, RegisterFormData, PersonalInfoStep, AddressStep, PasswordStep } from '@/types/register';

const initialState: RegisterState = {
  currentStep: 1,
  formData: {
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    city: '',
    state: '',
    address: '',
  },
  isLoading: false,
  error: null,
};

const registerSlice = createSlice({
  name: 'register',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1;
      state.error = null;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
      state.error = null;
    },
    goToStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      state.error = null;
    },
    updatePersonalInfo: (state, action: PayloadAction<PersonalInfoStep>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    updateAddress: (state, action: PayloadAction<AddressStep>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    updatePassword: (state, action: PayloadAction<PasswordStep>) => {
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
  nextStep,
  prevStep,
  goToStep,
  updatePersonalInfo,
  updateAddress,
  updatePassword,
  setLoading,
  setError,
  resetForm,
} = registerSlice.actions;

export default registerSlice.reducer;