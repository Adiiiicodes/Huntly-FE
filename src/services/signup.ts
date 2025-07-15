import { SignupRequest, SignupResponse } from '@/types/auth';

// Get the API URL from environment or use the IP as fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6969';

/**
 * Enhanced signup function with comprehensive error handling and CORS fixes
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const url = `${API_URL}/api/auth/signup`;
    console.log('Making signup request to:', url);
    console.log('Request data:', { ...data, password: '[REDACTED]' });
    
    // Try the main signup approach first
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
      let responseData: SignupResponse;
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
          console.log('Signup successful, auth state saved');
        } else {
          console.warn('Response was OK but missing token or user data');
        }
        
        return responseData;
      } else {
        // Handle error response
        throw new Error(responseData.message || `Signup failed with status ${response.status}`);
      }
    } catch (fetchError) {
      // Enhanced network error handling
      console.error('Network/Fetch error:', fetchError);
      
      // Handle different fetch errors with specific messages
      if (fetchError instanceof TypeError) {
        if (fetchError.message === 'Failed to fetch') {
          // Try alternative approach with relative URL
          return await signupWithRelativeUrl(data);
        }
        throw new Error(`Network error: ${fetchError.message}. Please check your connection and try again.`);
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Signup error details:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during signup');
  }
};

/**
 * Alternative signup approach using relative URL (bypasses some CORS issues)
 */
const signupWithRelativeUrl = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    console.log('Trying alternative signup approach with relative URL');
    
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    console.log('Alternative approach response status:', response.status);
    const responseText = await response.text();
    
    // Parse response data
    let responseData: SignupResponse;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned an invalid response: ${responseText}`);
    }
    
    if (!response.ok) {
      throw new Error(responseData.message || `Signup failed with status ${response.status}`);
    }
    
    // Store auth data
    if (responseData.token && responseData.user) {
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
    }
    
    return responseData;
  } catch (altError) {
    console.error('Alternative signup approach failed:', altError);
    throw new Error('Cannot connect to the authentication server. Please check your network or contact support.');
  }
};

/**
 * Check if a username is available
 * Can be used for real-time validation during registration
 */
export const checkUsernameAvailability = async (name: string): Promise<boolean> => {
  try {
    // This endpoint would need to be implemented on your backend
    const response = await fetch(`${API_URL}/api/auth/check-username?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.available === true;
  } catch (error) {
    console.error('Username availability check failed:', error);
    return false; // Assume username is taken if check fails
  }
};