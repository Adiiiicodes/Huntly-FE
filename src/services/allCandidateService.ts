// src/services/allCandidateService.ts
import { Candidate } from '@/types/candidate';

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

export const allCandidatesService = {
  getAllCandidates: async (): Promise<Candidate[]> => {
    try {
      console.log('Fetching all candidates...');
      
      const response = await fetch('/api/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      // Check if data is wrapped in a response object
      let candidates: RawCandidate[] = [];
      
      if (Array.isArray(data)) {
        candidates = data;
      } else if (data.data && Array.isArray(data.data)) {
        candidates = data.data;
      } else if (data.candidates && Array.isArray(data.candidates)) {
        candidates = data.candidates;
      } else {
        console.error('Unexpected data structure:', data);
        return [];
      }
      
      console.log(`Found ${candidates.length} candidates`);
      
      // Log first candidate to see structure
      if (candidates.length > 0) {
        console.log('First candidate raw data:', candidates[0]);
        console.log('First candidate about field:', candidates[0].about);
        console.log('First candidate summary field:', candidates[0].summary);
      }
      
      // Format each candidate
      return candidates.map((candidate, index) => {
        const formatted = formatCandidate(candidate);
        if (index === 0) {
          console.log('First candidate after formatting:', formatted);
        }
        return formatted;
      });
      
    } catch (error) {
      console.error('Error fetching all candidates:', error);
      return [];
    }
  }
};

function formatCandidate(candidate: RawCandidate): Candidate {
  console.log('Formatting candidate:', candidate._id || candidate.id);
  console.log('Raw about:', candidate.about);
  console.log('Raw summary:', candidate.summary);
  
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
    summary: candidate.summary || candidate.about || '',
    about: candidate.about || candidate.summary || '',
    avatar: candidate.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName || candidate.name || candidate.id || 'user')}`,
    salary: candidate.salary || 'N/A',
    education: candidate.education || 'N/A',
    linkedinUrl: candidate.linkedinUrl || '',
    email: candidate.email || 'N/A',
  };
  
  console.log('Formatted about:', formatted.about);
  console.log('Formatted summary:', formatted.summary);
  
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