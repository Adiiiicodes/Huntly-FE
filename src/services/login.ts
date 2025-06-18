import { LoginRequest, AuthResponse } from '../types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6969';

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const url = `${API_URL}/api/auth/login`;
    console.log('Making login request to:', url);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', { ...responseData, token: responseData.token ? '[REDACTED]' : null });
      
      if (!response.ok) {
        throw new Error(responseData.message || `Login failed with status ${response.status}`);
      }
      
      return responseData;
    } catch (fetchError) {
      console.error('Network error:', fetchError);
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to the API server at ${url}. Please make sure the server is running and accessible.`);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Login error details:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during login');
  }
};