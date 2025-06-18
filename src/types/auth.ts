export interface SignupRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface SignupResponse {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }
  
  export interface AuthResponse {
    token?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    message?: string;
  } 