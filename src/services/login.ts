import { LoginRequest, AuthResponse } from '../types/auth';

// Get the API URL from environment or use the IP as fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://huntly-be-880043945889.asia-south1.run.app8';

/**
 * Enhanced login function with comprehensive error handling and CORS fixes
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const url = `${API_URL}/api/auth/login`;
    console.log('Making login request to:', url);
    console.log('Login payload:', { ...data, password: '[REDACTED]' });
    
    // Enhanced fetch with multiple CORS fixes
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // The following headers can help with CORS in some environments
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(data),
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Try 'omit' instead of 'include' for cross-origin requests
        cache: 'no-cache',
        redirect: 'follow'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get response as text first to avoid JSON parsing errors
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Only try to parse as JSON if there's content
      let responseData: AuthResponse;
      if (responseText.trim()) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error(`Server returned an invalid response: ${responseText}`);
        }
      } else {
        responseData = { success: false, message: 'Empty response from server' };
      }
      
      // Handle successful response
      if (response.ok) {
        if (responseData.token && responseData.user) {
          // Store the token for future requests
          localStorage.setItem('token', responseData.token);
          localStorage.setItem('user', JSON.stringify(responseData.user));
          
          // Log success for debugging
          console.log('Login successful, auth state saved');
        } else {
          console.warn('Response was OK but missing token or user data');
        }
        
        return responseData;
      } else {
        // Handle error response
        throw new Error(responseData.message || `Login failed with status ${response.status}`);
      }
    } catch (fetchError) {
      // Enhanced network error handling
      console.error('Network/Fetch error:', fetchError);
      
      // Handle different fetch errors with specific messages
      if (fetchError instanceof TypeError) {
        if (fetchError.message === 'Failed to fetch') {
          // Try alternative approach with relative URL
          return await loginWithRelativeUrl(data);
        }
        throw new Error(`Network error: ${fetchError.message}. Please check your connection and try again.`);
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

/**
 * Alternative login approach using relative URL (bypasses some CORS issues)
 */
const loginWithRelativeUrl = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    console.log('Trying alternative login approach with relative URL');
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    console.log('Alternative approach response status:', response.status);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `Login failed with status ${response.status}`);
    }
    
    // Store auth data
    if (responseData.token && responseData.user) {
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    
    return responseData;
  } catch (altError) {
    console.error('Alternative login approach failed:', altError);
    throw new Error('Cannot connect to the authentication server. Please check your network or contact support.');
  }
};

/**
 * Utility function to check if the API is accessible
 * Can be used to test connectivity before showing login form
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};