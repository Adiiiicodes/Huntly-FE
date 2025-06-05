// lib/types.ts

export interface Candidate {
  id: string;
  name: string;
  location: string;
  skills: string[];
  experience?: string;
  experience_years: number;
  relevance_score?: number;
  rank?: string;
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