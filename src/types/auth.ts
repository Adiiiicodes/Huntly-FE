export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  savedProfiles?: string[];
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
  login: (token: string, user: UserData) => void;
  logout: () => void;
}