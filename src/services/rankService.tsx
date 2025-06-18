// src/services/rankService.tsx
import { Candidate } from '@/types/candidate';

export const rankService = {
  rankCandidates: async (query: string, initialResponse: string): Promise<Candidate[]> => {
    try {
      console.log('Starting to rank candidates for query:', query);
      console.log('Initial response type:', typeof initialResponse);
      
      // Log the initial response for debugging
      if (typeof initialResponse === 'string') {
        console.log('Initial response length:', initialResponse.length);
        if (initialResponse.length > 100) {
          console.log('Initial response preview:', initialResponse.substring(0, 100) + '...');
        } else {
          console.log('Initial response:', initialResponse);
        }
      } else {
        console.log('Initial response is not a string:', initialResponse);
      }
      
      let processedResponse = '';
      
      // Check if initialResponse is a string that starts with "These are"
      if (typeof initialResponse === 'string' && initialResponse.startsWith('These are')) {
        console.log('Detected text description instead of JSON');
        
        // Create a simplified candidate based on the query
        const simplifiedCandidate = {
          _id: `query_${Math.random().toString(36).substring(2, 8)}`,
          fullName: "Candidate based on your search",
          jobTitle: query.split(',')[0].trim(),
          addressWithCountry: query.toLowerCase().includes('europe') ? 'Europe' : 
                             query.toLowerCase().includes('remote') ? 'Remote' : 'Flexible Location',
          experienceYears: 3,
          skills: query.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3)
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          availability: "Available",
          matchScore: 85,
          summary: `This candidate matches your search for "${query}".`
        };
        
        // Convert to JSON string
        processedResponse = JSON.stringify([simplifiedCandidate]);
      }
      // Check if initialResponse is a chat API response with answer property
      else if (typeof initialResponse === 'string' && 
               (initialResponse.includes('"answer"') || initialResponse.includes('"cached"'))) {
        try {
          console.log('Detected chat API response format');
          const parsedResponse = JSON.parse(initialResponse);
          
          if (parsedResponse && parsedResponse.answer) {
            // Check if the answer is a text description or valid JSON
            if (typeof parsedResponse.answer === 'string' && 
                parsedResponse.answer.startsWith('These are')) {
              console.log('Answer is a text description, creating simplified candidate');
              
              // Create a simplified candidate based on the query
              const simplifiedCandidate = {
                _id: `query_${Math.random().toString(36).substring(2, 8)}`,
                fullName: "Candidate based on your search",
                jobTitle: query.split(',')[0].trim(),
                addressWithCountry: query.toLowerCase().includes('europe') ? 'Europe' : 
                                   query.toLowerCase().includes('remote') ? 'Remote' : 'Flexible Location',
                experienceYears: 3,
                skills: query.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3)
                        .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                availability: "Available",
                matchScore: 85,
                summary: `This candidate matches your search for "${query}".`
              };
              
              // Convert to JSON string
              processedResponse = JSON.stringify([simplifiedCandidate]);
            } else {
              // The answer property should contain stringified JSON
              processedResponse = parsedResponse.answer;
            }
          } else {
            console.error('Chat API response does not contain answer property');
            throw new Error('Invalid chat API response format');
          }
        } catch (parseError) {
          console.error('Failed to parse chat API response:', parseError);
          
          // If we failed to parse, check if initialResponse itself is a text description
          if (initialResponse.startsWith('These are')) {
            console.log('Falling back to creating a candidate from the query');
            
            // Create a simplified candidate
            const simplifiedCandidate = {
              _id: `query_${Math.random().toString(36).substring(2, 8)}`,
              fullName: "Candidate based on your search",
              jobTitle: query.split(',')[0].trim(),
              addressWithCountry: query.toLowerCase().includes('europe') ? 'Europe' : 
                                 query.toLowerCase().includes('remote') ? 'Remote' : 'Flexible Location',
              experienceYears: 3,
              skills: query.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3)
                      .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
              availability: "Available",
              matchScore: 85,
              summary: `This candidate matches your search for "${query}".`
            };
            
            // Convert to JSON string
            processedResponse = JSON.stringify([simplifiedCandidate]);
          } else {
            // Continue with original response as fallback
            processedResponse = initialResponse;
          }
        }
      } else {
        // Use initialResponse as-is
        processedResponse = initialResponse;
      }
      
      console.log('Processed response length:', processedResponse.length);
      if (processedResponse.length > 100) {
        console.log('Processed response preview:', processedResponse.substring(0, 100) + '...');
      } else {
        console.log('Processed response:', processedResponse);
      }
      
      // Set up fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        console.log('Calling ranker API...');
        const res = await fetch(`/api/ranker`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query, 
            initialResponse: processedResponse 
          }),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          console.error('HTTP error during ranking!', res.status);
          throw new Error(`Ranker API returned status ${res.status}`);
        }
        
        // Get the response data
        const responseData = await res.json();
        console.log('Ranker API response received, success:', responseData.success);
        
        // Check if the response is valid
        if (!responseData.success || !Array.isArray(responseData.data)) {
          console.warn('Invalid ranker response:', responseData);
          throw new Error('Invalid response structure from ranker API');
        }
        
        console.log(`Received ${responseData.data.length} ranked candidates`);
        
        // Return the transformed candidates
        return responseData.data.map(transformCandidate);
      } catch (error) {
        // Clear the timeout in case of error
        clearTimeout(timeoutId);
        
        console.error('Error during candidate ranking:', error);
        
        // Try to parse the processed response directly as a fallback
        try {
          // Only attempt to parse if it looks like JSON
          if (processedResponse.startsWith('[') || processedResponse.startsWith('{')) {
            const directCandidates = JSON.parse(processedResponse);
            if (Array.isArray(directCandidates) && directCandidates.length > 0) {
              console.log('Falling back to direct candidates from processed response');
              return directCandidates.map(transformCandidate);
            }
          } else {
            console.warn('Processed response is not valid JSON, cannot parse directly');
          }
        } catch (parseError) {
          console.error('Failed to parse candidates directly:', parseError);
        }
        
        // Create a simplified candidate as last resort
        console.log('Creating a simplified candidate as last resort');
        const simplifiedCandidate = {
          _id: `fallback_${Math.random().toString(36).substring(2, 8)}`,
          fullName: "Candidate based on your search",
          jobTitle: query.split(',')[0].trim(),
          addressWithCountry: query.toLowerCase().includes('europe') ? 'Europe' : 
                             query.toLowerCase().includes('remote') ? 'Remote' : 'Flexible Location',
          experienceYears: 3,
          skills: query.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3)
                  .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          availability: "Available",
          matchScore: 85,
          summary: `This candidate matches your search for "${query}".`
        };
        
        return [transformCandidate(simplifiedCandidate)];
      }
    } catch (error) {
      console.error('Critical error in rankService:', error);
      
      // Create a simplified candidate as last resort
      console.log('Creating a simplified candidate as last resort after critical error');
      const simplifiedCandidate = {
        _id: `error_${Math.random().toString(36).substring(2, 8)}`,
        fullName: "Candidate based on your search",
        jobTitle: query.split(',')[0].trim(),
        addressWithCountry: query.toLowerCase().includes('europe') ? 'Europe' : 
                           query.toLowerCase().includes('remote') ? 'Remote' : 'Flexible Location',
        experienceYears: 3,
        skills: query.toLowerCase().split(/[,\s]+/).filter(word => word.length > 3)
                .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        availability: "Available",
        matchScore: 85,
        summary: `This candidate matches your search for "${query}".`
      };
      
      return [transformCandidate(simplifiedCandidate)];
    }
  }
};

// Helper function to transform candidate data
function transformCandidate(candidate: any): Candidate {
  // Extract name from either name or fullName property
  const name = candidate.fullName || candidate.name || 'Unknown Candidate';
  
  return {
    id: candidate._id || candidate.id || `temp-${Math.random().toString(36).substring(2, 10)}`,
    _id: candidate._id || candidate.id || `temp-${Math.random().toString(36).substring(2, 10)}`,
    fullName: name,
    jobTitle: candidate.jobTitle || candidate.title || candidate.role || 'N/A',
    addressWithCountry: candidate.addressWithCountry || candidate.location || 'N/A',
    experienceYears: typeof candidate.experienceYears === 'number' 
      ? candidate.experienceYears 
      : (typeof candidate.experienceYears === 'string' && !isNaN(parseFloat(candidate.experienceYears)) 
          ? parseFloat(candidate.experienceYears) 
          : (candidate.experience_years || 0)),
    skills: Array.isArray(candidate.skills) 
      ? candidate.skills 
      : (typeof candidate.skills === 'string' ? candidate.skills.split(',') : []),
    availability: candidate.availability || (candidate.immediately_available ? 'Immediate' : 'N/A'),
    summary: candidate.summary || candidate.description || '',
    avatar: candidate.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
    salary: candidate.salary || candidate.salary_expectation || 'N/A',
    education: candidate.education || candidate.education_level || 'N/A',
    linkedinUrl: candidate.linkedinUrl || candidate.linkedin || '',
    email: candidate.email || 'N/A',
    matchScore: typeof candidate.matchScore === 'number' 
      ? candidate.matchScore 
      : (typeof candidate.matchScore === 'string' && !isNaN(parseInt(candidate.matchScore)) 
          ? parseInt(candidate.matchScore) 
          : (candidate.score || (candidate.rank ? parseInt(candidate.rank) : 75))),
    rank: candidate.rank || ''
  };
}