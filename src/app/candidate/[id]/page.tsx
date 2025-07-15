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
    if (!years) return 'Not specified';
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

        const allCandidates = await allCandidatesService.getAllCandidates();
        const foundCandidate = allCandidates.find(c => c.id === id || c._id === id);

        if (foundCandidate) {
          setCandidate(foundCandidate);
          return;
        }

        const searchResults = await candidateService.searchCandidates(id);
        const searchCandidate = searchResults.find(c => c.id === id || c._id === id);

        if (searchCandidate) {
          setCandidate(searchCandidate);
          return;
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

  type SkillType = string | { title: string };
  
  const buildSkillGapData = (candidateSkills: SkillType[] = []) => {
    return requiredSkills.map(skill => ({
      skill,
      candidate: candidateSkills.some(s => {
        const skillStr = typeof s === 'string' ? s : (s as { title: string }).title;
        return skillStr && skillStr.toLowerCase().includes(skill.toLowerCase());
      }) ? 100 : 0,
      required: 100
    }));
  };

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start space-x-6">
                      <Skeleton className="w-24 h-24 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-5 w-2/3" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24" />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-[400px] w-full" />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-1/5 mb-1" />
                      <Skeleton className="h-5 w-3/4" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-1/5 mb-1" />
                      <Skeleton className="h-5 w-4/5" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-1/5 mb-1" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <Card>
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <img
                      src={candidate.avatar}
                      alt={candidate.fullName}
                      className="w-24 h-24 rounded-full object-cover"
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

              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">
                    {candidate.summary || 'No professional summary provided.'}
                  </p>
                </CardContent>
              </Card>

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

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    asChild
                    className="w-full bg-black text-white"
                    onClick={() => {
                      const email = candidate.email;
                      if (email) {
                        window.open(
                          `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
                          '_blank'
                        );
                      } else {
                        alert('No email address available for this candidate');
                      }
                    }}
                  >
                    <a>
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Candidate
                    </a>
                  </Button>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {candidate.availability || 'Availability not specified'}
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {candidate.email || 'No email provided'}
                    </div>
                    {candidate.linkedinUrl && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                    <div className="text-slate-900 flex flex-col gap-1">
                      <span className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2" />
                      </span>
                      {Array.isArray(candidate.education) ? (
                        candidate.education.length > 0 ? (
                          candidate.education.map((edu, idx) => (
                            <span key={idx}>
                              <span className="font-semibold">{edu.school}</span>
                              {edu.degree && `, ${edu.degree}`}
                              {edu.description && ` - ${edu.description}`}
                            </span>
                          ))
                        ) : (
                          <span className="italic text-slate-500">No education listed</span>
                        )
                      ) : typeof candidate.education === 'object' && candidate.education !== null ? (
                        <span>
                          <span className="font-semibold">{candidate.education.school}</span>
                          {candidate.education.degree && `, ${candidate.education.degree}`}
                          {candidate.education.description && ` - ${candidate.education.description}`}
                        </span>
                      ) : (
                        <span>{candidate.education || 'Not specified'}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Availability:</span>
                    <p className="text-slate-900">{candidate.availability || 'Not specified'}</p>
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