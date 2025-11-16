export interface UserProfile {
  id: string;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  id: string;
  email: string;
  role: string;
  profile: UserProfile | null;
}

export interface ProfileApiResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}