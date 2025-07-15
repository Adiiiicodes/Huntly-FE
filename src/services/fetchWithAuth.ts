// services/fetchWithAuth.ts
//import { useAuth } from '@/contexts/AuthContext';

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to login if no token is found
    window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    throw new Error('Authentication required to access this resource');
  }

  // Prepare headers with authentication token
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      throw new Error('Authentication expired. Please login again.');
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
};