-- Enables UUID generation
create extension if not exists pgcrypto;

CREATE TABLE candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  age INTEGER NOT NULL,
  location VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  experience VARCHAR(100) NOT NULL,
  skills TEXT[] NOT NULL,
  availability VARCHAR(50) NOT NULL,
  salary VARCHAR(100) NOT NULL,
  education VARCHAR(500) NOT NULL,
  summary TEXT NOT NULL,
  linkedin VARCHAR(255),
  github VARCHAR(255),
  portfolio VARCHAR(255),
  resume VARCHAR(255) NOT NULL,
  remote_work BOOLEAN DEFAULT false,
  relocation BOOLEAN DEFAULT false,
  match_score INTEGER DEFAULT 0,
  avatar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Allow INSERTs for registration
CREATE POLICY "Allow candidate registration" ON candidates
  FOR INSERT WITH CHECK (true);

-- Allow SELECTs for browsing
CREATE POLICY "Allow reading candidates" ON candidates
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills);
