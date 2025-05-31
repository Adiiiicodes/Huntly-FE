import mongoose, { Schema } from 'mongoose';

export interface IProject {
  name: string;
  category: string[];
  description: string;
  fullDescription?: string;
  repoLink: string;
  thumbnail: string;
  technologies: string[];
  slug: string;
  featured?: boolean;
  size?: 'small' | 'medium' | 'large';
  createdAt?: Date;
  updatedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    category: { type: [String], required: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    repoLink: { type: String, required: true },
    thumbnail: { type: String, required: true },
    technologies: { type: [String], required: true },
    slug: { type: String, required: true, unique: true },
    featured: { type: Boolean, default: false },
    size: { type: String, enum: ['small', 'medium', 'large'], default: 'small' }
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);