// lib/types.ts

export interface Candidate {
  _id: string;
  fullName: string;
  jobTitle: string;
  addressWithCountry: string;
  experienceYears: number;
  skills: string[];
  availability: string;
  matchScore: number;
  summary: string | null;
  avatar: string | null;
  salary: number | null;
  education: string;
  linkedinUrl: string | null;
}

export interface ApiResponse {
  success: boolean;
  data: Candidate[];
  message?: string;
  error?: string;
}

export interface LocationData {
  name: string;
  value: number;
}

export interface SkillData {
  name: string;
  value: number;
}