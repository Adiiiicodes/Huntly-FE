// services/savedProfiles.ts
interface SavedProfile {
    _id: string;
    id?: string;
    fullName: string;
    linkedinUrl?: string;
    email: string;
    mobileNumber?: string;
    jobTitle?: string;
    addressWithCountry?: string;
    experienceYears?: number;
    [key: string]: any; // For any other properties in the profile
  }
  
  /**
   * Fetch saved profiles for a user
   * @param userId The MongoDB ObjectId of the user
   * @returns Array of saved profile objects
   */
  export const getSavedProfiles = async (userId: string): Promise<SavedProfile[]> => {
    if (!userId) {
      throw new Error('User ID is required');
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      console.log(`Attempting to fetch profiles for user ${userId} with token: ${token.substring(0, 15)}...`);
      
      // Try with Authorization Bearer token header (most common approach)
      const response = await fetch(`http://168.231.122.158/api/profiles/save/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Still include credentials for cookies if needed
      });
  
      if (!response.ok) {
        // Add more detailed error handling
        if (response.status === 404) {
          console.log('No saved profiles found or endpoint not available');
          return [];
        }
        
        // Try to parse error response if it's JSON
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          // If not JSON, get as text
          const errorText = await response.text();
          errorMessage = errorText;
        }
        
        throw new Error(`API call failed with status: ${response.status}, message: ${errorMessage}`);
      }
  
      const data = await response.json();
      console.log('Saved profiles data:', data);
  
      // Return empty array if no data or not an array
      if (!data || !Array.isArray(data)) {
        console.warn('Unexpected data format from API:', data);
        return [];
      }
  
      return data;
    } catch (error) {
      console.error('Error fetching saved profiles:', error);
      throw error;
    }
  };
  
  /**
   * Transform API profile data to a format suitable for display
   */
  export const formatProfileForDisplay = (profile: SavedProfile) => {
    return {
      id: profile._id || profile.id || '',
      name: profile.fullName || 'Unknown Name',
      position: profile.jobTitle || 'No Position',
      lastActivity: profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : undefined
    };
  };