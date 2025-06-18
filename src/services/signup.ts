import { SignupRequest, SignupResponse } from '@/types/auth';

// Use the full URL from your backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://168.231.122.158';

export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  try {
    const url = `${API_URL}/api/auth/signup`;
    console.log('Making signup request to:', url);
    console.log('Request data:', { ...data, password: '[REDACTED]' });
    
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
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Log the raw response text for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response was:', responseText);
        throw new Error(`Server returned an invalid response (${response.status}). Please check if the API is running at ${url}`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || `Signup failed with status ${response.status}`);
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
    console.error('Signup error details:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred during signup');
  }
};

