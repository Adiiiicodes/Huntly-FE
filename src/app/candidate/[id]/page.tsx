'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { Candidate } from '@/types/candidate';
import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { candidateService } from '@/services/candidateService';
import { allCandidatesService } from '@/services/allCandidateService';

const CandidateProfile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format experience to show years or months
  const formatExperience = (years: number) => {
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
    // Check if we have a search query in the URL
    const query = searchParams?.get('query');
    if (query) {
      router.push(`/?query=${encodeURIComponent(query)}`);
    } else {
      router.push('/');
    }
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
                        <Skeleton className="h-8 w-40" />
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
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24" />
                      ))}
                    </div>
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
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <img
                      src={candidate.avatar}
                      alt={candidate.fullName}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{candidate.fullName}</h1>
                      <p className="text-xl text-blue-600 font-medium mb-2">{candidate.jobTitle}</p>
                      <div className="flex items-center text-slate-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {candidate.addressWithCountry}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">
                    {candidate.summary || 'No professional summary provided.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills?.length > 0 ? (
                      candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-slate-500">No skills listed</p>
                    )}
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
                      {candidate.experienceYears ? formatExperience(candidate.experienceYears) : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Education:</span>
                    <p className="text-slate-900 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {candidate.education || 'Not specified'}
                    </p>
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