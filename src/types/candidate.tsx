export interface Candidate {
  _id: { $oid: string } | string;
  unique_id?: string;
  about?: string;
  connections?: number;
  education: {
    school: string;
    degree?: string;
    description?: string;
  }[] | {
    school: string;
    degree?: string;
    description?: string;
  } | string;
  email: string;
  experienceYears: number;
  experiences?: {
    companyId: string;
    companyUrn: string;
    companyLink: string;
    logo: string;
    title: string;
    subtitle: string;
    caption: string;
    metadata: string;
    descriptions: string;
  }[];
  followers?: number;
  fullName: string;
  jobTitle: string;
  languages?: string[];
  last_updated?: { $date: string };
  linkedinUrl: string;
  mobileNumber?: string;
  profilePic?: string;
  profilePicHighQuality?: string;
  recommendations?: any[];
  skills: { title: string; endorsementCount: number; endorsementText: string }[] | string[];
  source_file?: string;
  updates?: any[];
  addressWithCountry?: string;
  avatar?: string;
  salary?: string;
  summary?: string;
  matchScore?: number;
  rank?: string;
  availability?: string;
}