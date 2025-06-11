import { Candidates } from '@/types/candidate';

export const allCandidatesService = {
  getAllCandidates: async (): Promise<Candidates[]> => {
    try {
      const res = await fetch(`/api/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType?.includes('application/json')) {
        const errorText = await res.text();
        console.error('Invalid response:', errorText);
        return [];
      }

      const responseData = await res.json();

      const candidatesArray = Array.isArray(responseData)
        ? responseData
        : responseData?.data;

      if (!Array.isArray(candidatesArray)) {
        console.warn('Candidates data is not an array');
        return [];
      }

      return candidatesArray.map(candidate => ({
        _id: candidate.id || candidate._id || '',
        fullName: candidate.fullName || '',
        jobTitle: candidate.jobTitle || 'N/A',
        addressWithCountry: candidate.addressWithCountry || 'Unknown',
        experienceYears: candidate.experienceYears ?? 'N/A', // <= fix here
        skills: candidate.skills || [],
        availability: candidate.availability || 'Not specified',
        summary: candidate.mobileNumber || '',
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName || 'user')}`,
        salary: candidate.salary || 'N/A',
        education: candidate.education || 'N/A',
        linkedinUrl: candidate.linkedinUrl || '',
        email: candidate.email || 'N/A',
      }));
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  },
};
