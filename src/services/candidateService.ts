import { Candidate } from '@/types/candidate';
import { fetchWithAuth } from '@/services/fetchWithAuth';

interface RawCandidate {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  about?: string;
  jobTitle?: string;
  title?: string;
  addressWithCountry?: string;
  location?: string;
  experienceYears?: number | string;
  skills?: string[] | Array<{ title: string }>;
  availability?: string;
  matchScore?: number;
  summary?: string;
  avatar?: string;
  salary?: string;
  education?: string | Array<{ school: string; degree?: string; description?: string }> | { school: string; degree?: string; description?: string };
  linkedinUrl?: string;
  email?: string;
}

export const candidateService = {
  searchCandidates: async (query: string): Promise<Candidate[]> => {
    try {
      console.log('Starting candidate search for query:', query);
      
      let candidates: RawCandidate[] = [];
      
      try {
        console.log('Calling chat API with query:', query);
        
        const chatResponse = await fetchWithAuth('/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            question: query
          })
        });
        
        console.log('Chat API raw response:', chatResponse);
        
        if (!chatResponse || !chatResponse.answer) {
          console.error('Invalid chat API response:', chatResponse);
          throw new Error('Chat API did not return expected data');
        }
        
        // Handle different response formats
        if (typeof chatResponse.answer === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(chatResponse.answer);
            if (Array.isArray(parsed)) {
              candidates = parsed;
            } else if (parsed.candidates && Array.isArray(parsed.candidates)) {
              candidates = parsed.candidates;
            } else {
              console.error('Unexpected parsed structure:', parsed);
              candidates = [];
            }
          } catch (parseError) {
            console.error('Failed to parse as JSON, response might be HTML:', chatResponse.answer.substring(0, 200));
            candidates = [];
          }
        } else if (Array.isArray(chatResponse.answer)) {
          candidates = chatResponse.answer;
        } else if (chatResponse.candidates && Array.isArray(chatResponse.candidates)) {
          candidates = chatResponse.candidates;
        } else {
          console.error('Unexpected answer format:', chatResponse.answer);
          candidates = [];
        }
        
        console.log(`Successfully extracted ${candidates.length} candidates from chat API`);
        
      } catch (chatError) {
        console.error('Error fetching from chat API:', chatError);
        throw chatError;
      }
      
      // Format and log each candidate for debugging
      const formattedCandidates = candidates.map((candidate, index) => {
        console.log(`Raw candidate ${index}:`, candidate);
        const formatted = formatCandidate(candidate);
        console.log(`Formatted candidate ${index}:`, formatted);
        return formatted;
      });
      
      return formattedCandidates;
      
    } catch (error) {
      console.error('Candidate search failed:', error);
      return [];
    }
  }
};

function formatCandidate(candidate: RawCandidate): Candidate {
  // Debug: Log what fields are actually present
  console.log('Formatting candidate with fields:', Object.keys(candidate));
  console.log('About field value:', candidate.about);
  console.log('Summary field value:', candidate.summary);
  
  const formatted: Candidate = {
    id: candidate._id || candidate.id || Math.random().toString(36).substring(2),
    _id: candidate._id || candidate.id || Math.random().toString(36).substring(2),
    fullName: candidate.fullName || candidate.name || 'N/A',
    jobTitle: candidate.jobTitle || candidate.title || 'Not Specified',
    addressWithCountry: candidate.addressWithCountry || candidate.location || 'Unknown',
    experienceYears: typeof candidate.experienceYears === 'number' 
      ? candidate.experienceYears 
      : (typeof candidate.experienceYears === 'string' 
        ? parseFloat(candidate.experienceYears) || 0 
        : 0),
    skills: formatSkills(candidate.skills),
    availability: candidate.availability || 'Unknown',
    matchScore: typeof candidate.matchScore === 'number' ? candidate.matchScore : 0,
    // Ensure both fields are populated
    summary: candidate.summary || candidate.about || '',
    about: candidate.about || candidate.summary || '',
    avatar: candidate.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName || candidate.name || candidate.id || 'user')}`,
    salary: candidate.salary || 'N/A',
    education: candidate.education || 'N/A',
    linkedinUrl: candidate.linkedinUrl || '',
    email: candidate.email || 'N/A',
  };
  
  console.log('Formatted candidate about field:', formatted.about);
  console.log('Formatted candidate summary field:', formatted.summary);
  
  return formatted;
}

function formatSkills(skills: any): string[] {
  if (!skills) return [];
  
  if (Array.isArray(skills)) {
    return skills.map(skill => {
      if (typeof skill === 'string') return skill;
      if (skill && typeof skill === 'object' && skill.title) return skill.title;
      return '';
    }).filter(Boolean);
  }
  
  return [];
}