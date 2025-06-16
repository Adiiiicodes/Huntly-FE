import { Candidate } from '@/types/candidate';

interface RawCandidate {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  jobTitle?: string;
  title?: string;
  addressWithCountry?: string;
  location?: string;
  experienceYears?: number | string;
  skills?: string[];
  availability?: string;
  matchScore?: number;
  summary?: string;
  avatar?: string;
  salary?: string;
  education?: string;
  linkedinUrl?: string;
  email?: string;
}

export const candidateService = {
  searchCandidates: async (query: string): Promise<Candidate[]> => {
    try {
      console.log('Starting candidate search for query:', query);
      
      // Step 1: Get initial candidates from chat API
      let candidates: RawCandidate[] = [];
      
      try {
        console.log('Calling chat API with query:', query);
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: query
          })
        });
        
        if (!chatResponse.ok) {
          console.error(`Chat API error: ${chatResponse.status}`);
          throw new Error(`Chat API returned status ${chatResponse.status}`);
        }
        
        const chatData = await chatResponse.json();
        console.log('Chat API response received');
        
        if (!chatData || !chatData.answer) {
          console.error('Invalid chat API response:', chatData);
          throw new Error('Chat API did not return expected data');
        }
        
        // If answer is a string that looks like JSON, parse it
        if (typeof chatData.answer === 'string') {
          try {
            const parsedCandidates = JSON.parse(chatData.answer);
            if (Array.isArray(parsedCandidates)) {
              candidates = parsedCandidates;
              console.log(`Successfully parsed ${candidates.length} candidates from chat API`);
            } else {
              console.error('Chat API returned non-array data:', parsedCandidates);
              throw new Error('Chat API did not return an array of candidates');
            }
          } catch (parseError) {
            console.error('Failed to parse candidates from chat API:', parseError);
            throw new Error('Could not parse candidate data from chat API');
          }
        } else if (Array.isArray(chatData.answer)) {
          // If answer is directly an array
          candidates = chatData.answer;
          console.log(`Got ${candidates.length} candidates directly from chat API`);
        } else {
          console.error('Unexpected answer format from chat API:', chatData.answer);
          throw new Error('Chat API returned unexpected data format');
        }
      } catch (chatError) {
        console.error('Error fetching from chat API:', chatError);
        throw chatError;
      }
      
      // Step 2: Format candidates for display
      return candidates.map(formatCandidate);
      
    } catch (error) {
      console.error('Candidate search failed:', error);
      
      // Return empty array on error
      return [];
    }
  }
};

// Helper function to format candidate data for the CandidateCard component
function formatCandidate(candidate: RawCandidate): Candidate {
  return {
    id: candidate._id || candidate.id || Math.random().toString(36).substring(2),
    _id: candidate._id || candidate.id || Math.random().toString(36).substring(2),
    fullName: candidate.fullName || candidate.name || 'N/A',
    jobTitle: candidate.jobTitle || candidate.title || 'Not Specified',
    addressWithCountry: candidate.addressWithCountry || candidate.location || 'Unknown',
    experienceYears: typeof candidate.experienceYears === 'number' 
      ? candidate.experienceYears 
      : (typeof candidate.experienceYears === 'string' 
        ? parseFloat(candidate.experienceYears) 
        : 0),
    skills: Array.isArray(candidate.skills) ? candidate.skills : [],
    availability: candidate.availability || 'Unknown',
    matchScore: typeof candidate.matchScore === 'number' ? candidate.matchScore : 0,
    summary: candidate.summary || '',
    avatar: candidate.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName || candidate.id || 'user')}`,
    salary: candidate.salary || 'N/A',
    education: candidate.education || 'N/A',
    linkedinUrl: candidate.linkedinUrl || '',
    email: candidate.email || 'N/A',
  };
}