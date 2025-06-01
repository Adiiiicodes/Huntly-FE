export interface Candidate {
  id: string;
  name: string;
  location: string;
  skills: string[];
  experience_years: number;
}

export interface ApiResponse {
  success: boolean;
  data: Candidate[];
}

export interface LocationData {
  name: string;
  value: number;
}

export interface SkillData {
  name: string;
  value: number;
}

export interface ExperienceData {
  name: string;
  'Experience (years)': number;
}