// src/services/rankService.tsx
import { Candidate } from '@/types/candidate';

export const rankService = {
  rankCandidates: async (query: string, initialResponse: string): Promise<Candidate[]> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://2625-2405-201-4a-70a0-8c11-cd71-fd69-d07.ngrok-free.app';

      const res = await fetch(`${apiUrl}/api/ranker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, initialResponse })
      });

      if (!res.ok) {
        console.error('HTTP error during ranking!', res.status);
        return [];
      }

      const responseData = await res.json();
      console.log('Raw response from /api/ranker:', responseData);

      if (!responseData.success || !Array.isArray(responseData.data)) {
        console.warn('Ranker response invalid:', responseData);
        return [];
      }

      // Enhanced data transformation with better property mapping
      return responseData.data.map((candidate: any): Candidate => {
        // Extract name from either name or fullName property
        const name =  candidate.fullName || 'Unknown Candidate';
        
        return {
          id: candidate.id || candidate._id || `temp-${Math.random().toString(36).substring(2, 10)}`,
          _id: candidate._id || candidate.id || `temp-${Math.random().toString(36).substring(2, 10)}`,
          fullName: name,
          jobTitle: candidate.jobTitle || candidate.title || candidate.role || 'N/A',
          addressWithCountry: candidate.addressWithCountry || candidate.location || 'N/A',
          experienceYears: typeof candidate.experienceYears === 'number' 
            ? candidate.experienceYears 
            : (candidate.experience_years || 0),
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
            : (candidate.rank || 0),
          rank: candidate.rank || ''
        };
      });
    } catch (error) {
      console.error('Error during candidate ranking:', error);
      return [];
    }
  }
};