export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  city: string;
  state: string;
  address: string;
}

export interface RegisterState {
  currentStep: number;
  formData: RegisterFormData;
  isLoading: boolean;
  error: string | null;
}

export interface PersonalInfoStep {
  fullName: string;
  email: string;
  phone: string;
}

export interface AddressStep {
  address: string;
  city: string;
  state: string;
}

export interface PasswordStep {
  password: string;
  confirmPassword: string;
}