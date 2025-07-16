'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { Candidate } from '@/types/candidate';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { candidateService } from '@/services/candidateService';
import { allCandidatesService } from '@/services/allCandidateService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const requiredSkills = [
  'JavaScript',
  'React',
  'Node.js',
  'TypeScript',
  'Python',
  'Docker',
  'AWS',
  'PostgreSQL'
];

const CandidateProfile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatExperience = (years: number) => {
    if (!years || isNaN(years)) return 'Not specified';
    if (years < 1) {
      const months = Math.round(years * 12);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`;
  };

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching candidate with ID:', id);

        // Try allCandidatesService first
        try {
          const allCandidates = await allCandidatesService.getAllCandidates();
          console.log('All candidates received:', allCandidates.length);
          
          const foundCandidate = allCandidates.find(c => c.id === id || c._id === id);
          
          if (foundCandidate) {
            console.log('Found candidate in allCandidates:', foundCandidate);
            console.log('Candidate about field:', foundCandidate.about);
            console.log('Candidate summary field:', foundCandidate.summary);
            console.log('All candidate fields:', Object.keys(foundCandidate));
            setCandidate(foundCandidate);
            return;
          }
        } catch (allCandidatesError) {
          console.error('Error fetching from allCandidatesService:', allCandidatesError);
        }

        // Fallback to candidateService
        try {
          const searchResults = await candidateService.searchCandidates(id);
          console.log('Search results received:', searchResults.length);
          
          const searchCandidate = searchResults.find(c => c.id === id || c._id === id);
          
          if (searchCandidate) {
            console.log('Found candidate in search:', searchCandidate);
            console.log('Search candidate about field:', searchCandidate.about);
            console.log('Search candidate summary field:', searchCandidate.summary);
            setCandidate(searchCandidate);
            return;
          }
        } catch (searchError) {
          console.error('Error searching candidates:', searchError);
        }

        throw new Error('Candidate not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load candidate data');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCandidate();
    }
  }, [id]);

  const handleBack = () => {
    const query = searchParams?.get('query');
    if (query) {
      router.push(`/?query=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
  };

  const buildSkillGapData = (candidateSkills: (string | { title: string })[] = []) => {
    return requiredSkills.map(skill => ({
      skill,
      candidate: candidateSkills.some(s => {
        const skillStr = typeof s === 'string' ? s : s.title;
        return skillStr && skillStr.toLowerCase().includes(skill.toLowerCase());
      }) ? 100 : 0,
      required: 100
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading candidate details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <strong>Error: </strong> {error}
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // No candidate found
  if (!candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={handleBack} className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Results
            </Button>
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">
                Candidate not found
              </h2>
              <Button onClick={handleBack}>
                Return to candidate list
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={handleBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <img
                      src={candidate.avatar}
                      alt={candidate.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(candidate.fullName)}`;
                      }}
                    />
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">{candidate.fullName}</h1>
                      <p className="text-xl text-blue-600 font-medium">{candidate.jobTitle}</p>
                      <div className="flex items-center text-slate-600 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {candidate.addressWithCountry}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Add this inside the Professional Summary Card for debugging */}
<Card>
  <CardHeader>
    <CardTitle>Professional Summary</CardTitle>
  </CardHeader>
  <CardContent>
    
    
    {/* Original content */}
    <p className="text-slate-700 leading-relaxed">
      {candidate.about || candidate.summary || 'No professional summary provided.'}
    </p>
  </CardContent>
</Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {candidate.skills?.length > 0 ? (
                    candidate.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-blue-100 text-blue-800">
                        {typeof skill === 'string' ? skill : skill.title}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-500">No skills listed</p>
                  )}
                </CardContent>
              </Card>

              {/* Skill Gap Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={buildSkillGapData(candidate.skills)}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="skill" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar 
                          name="Candidate" 
                          dataKey="candidate" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Required" 
                          dataKey="required" 
                          stroke="#94a3b8" 
                          fill="#94a3b8" 
                          fillOpacity={0.2} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    <p className="mb-2">The radar chart shows how the candidate&apos;s skills match against our required skills:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The <span className="text-blue-500 font-medium">blue area</span> represents the candidate&apos;s skill level</li>
                      <li>The <span className="text-slate-500 font-medium">gray area</span> shows our required skill level</li>
                      <li>When the blue area covers the gray completely, it&apos;s a perfect match</li>
                      <li>Gaps indicate areas where the candidate may need upskilling</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => {
                      const email = candidate.email;
                      if (email && email !== 'N/A') {
                        window.open(
                          `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
                          '_blank'
                        );
                      } else {
                        alert('No email address available for this candidate');
                      }
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Candidate
                  </Button>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {candidate.availability || 'Availability not specified'}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {candidate.email && candidate.email !== 'N/A' ? candidate.email : 'No email provided'}
                    </div>
                    {candidate.linkedinUrl && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <a 
                          href={candidate.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="font-medium text-slate-600">Experience:</span>
                    <p className="text-slate-900">
                      {formatExperience(candidate.experienceYears)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Education:</span>
                    <p className="text-slate-900">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      {typeof candidate.education === 'string' 
                        ? candidate.education 
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Availability:</span>
                    <p className="text-slate-900">
                      {candidate.availability || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CandidateProfile;