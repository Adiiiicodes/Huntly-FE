// types/candidate.ts
export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  availability: string;
  matchScore: number;
  summary: string;
  avatar: string;
  salary: string;
  education: string;
}

export type Candidates = {
  email: string;
  _id: string;
  fullName: string;
  jobTitle: string;
  addressWithCountry?: string;
  experienceYears?: number | string;
  skills?: string[];
  availability?: string;
  matchScore?: number;
  summary?: string;
  avatar?: string;
  salary?: string;
  education?: string;
  linkedinUrl?: string;
};

