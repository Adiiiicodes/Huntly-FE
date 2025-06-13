export interface Candidate {
  id: string;
  _id: string;
  fullName: string;
  jobTitle: string;
  addressWithCountry: string;
  experienceYears: number; 
  skills: string[];
  availability: string;
  summary: string;
  avatar: string;
  salary: string;
  education: string;
  linkedinUrl: string;
  email: string;
  matchScore: number;
  rank?: string;
}
