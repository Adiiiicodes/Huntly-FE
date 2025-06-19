// services/profileService.ts
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
  
  interface ProfileResponse {
    success: boolean;
    message?: string;
    savedProfiles?: string[];
  }
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://168.231.122.158';
  
  /**
   * Fetch all saved profiles for the current user
   * @returns Array of saved profile objects
   */
  export const getSavedProfiles = async (): Promise<SavedProfile[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      console.log('Fetching saved profiles...');
      
      const response = await fetch(`${API_URL}/api/profiles/save/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        if (response.status === 404) {
          console.log('No saved profiles found');
          return [];
        }
        
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text();
        }
        
        throw new Error(`API call failed: ${errorMessage}`);
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
   * Save a candidate profile to user's saved profiles
   * @param candidateId The MongoDB ObjectId of the candidate
   * @returns Response object with success status and message
   */
  export const saveProfile = async (candidateId: string): Promise<ProfileResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      console.log(`Saving profile with ID: ${candidateId}`);
      
      const response = await fetch(`/api/profiles/save/${candidateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text();
        }
        
        return { success: false, message: errorMessage };
      }
  
      const data = await response.json();
      console.log('Save profile response:', data);
  
      return data;
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };
  
  /**
   * Remove a candidate profile from user's saved profiles
   * @param candidateId The MongoDB ObjectId of the candidate
   * @returns Response object with success status and message
   */
  export const removeProfile = async (candidateId: string): Promise<ProfileResponse> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
  
      console.log(`Removing profile with ID: ${candidateId}`);
      
      const response = await fetch(`${API_URL}/api/profiles/remove/${candidateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        let errorMessage = '';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMessage = await response.text();
        }
        
        throw new Error(`Failed to remove profile: ${errorMessage}`);
      }
  
      const data = await response.json();
      console.log('Remove profile response:', data);
  
      return data;
    } catch (error) {
      console.error('Error removing profile:', error);
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
      location: profile.addressWithCountry || 'Unknown Location',
      experience: profile.experienceYears 
        ? `${profile.experienceYears} ${profile.experienceYears === 1 ? 'year' : 'years'}`
        : 'Experience not specified'
    };
  };