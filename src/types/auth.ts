export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  email: string | null;
  profile_picture: string | null;
  date_of_birth: string | null;
  district: string;
  thana: string;
  full_address: string;
  trust_level: 'unverified' | 'verified' | 'partner';
  trust_badge: 'verified' | 'partner' | null;
  is_approved: boolean | null;
  profile_completed: boolean;
  average_rating: string;
  marketing_consent: boolean;
  member_since: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProfileStep1Form {
  date_of_birth: string;       // 'YYYY-MM-DD'
  district: string;
  thana: string;
  full_address: string;
  profile_picture?: File | null;
  email?: string;
}

export interface ProfileStep2Form {
  nid_number: string;
  nid_image: File;
  institutional_id_image?: File | null;
}
