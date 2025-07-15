export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}





export interface SignupResponse {
  success?: boolean;
  user?: UserData;
  message?: string;
}



// For use with API fetch wrappers
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
}


export interface UserData {
  id: string;
  name: string;
  email: string;
  savedProfiles?: string[];
  [key: string]: any; // For any additional properties
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  name: string;  // Changed from email to name for login
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: UserData;
  message?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserData) => void;
  logout: () => void;
  redirectToLogin: (redirectUrl?: string) => void;
  checkAuth: (redirectUrl?: string) => boolean;
  getAuthToken: () => string | null;
}