'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import { Candidate } from '@/types/candidate';
import React from 'react';

const CandidateProfile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id || '1';

  // Mock candidate data
  const candidate: Candidate = {
    id,
    name: 'Sarah Chen',
    title: 'Senior AI Engineer',
    location: 'Berlin, Germany',
    experience: '6 years',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'MLOps'],
    availability: 'Contract',
    matchScore: 95,
    summary:
      'Experienced AI engineer specializing in generative AI and large language models. Led multiple successful AI product launches.',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b587?w=300&h=300&fit=crop&crop=face',
    salary: '€85-100/hour',
    education: 'PhD Computer Science, Technical University of Berlin',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{candidate.name}</h1>
                      <p className="text-xl text-blue-600 font-medium mb-2">{candidate.title}</p>
                      <div className="flex items-center text-slate-600 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        {candidate.location}
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {candidate.matchScore}% Match
                        </Badge>
                        <span className="text-lg font-semibold text-slate-900">{candidate.salary}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* About */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed mb-4">{candidate.summary}</p>
                  <p className="text-slate-700 leading-relaxed">
                    Passionate about pushing the boundaries of artificial intelligence, with a focus on
                    developing scalable AI solutions that solve real-world problems. Experienced in leading
                    cross-functional teams and mentoring junior developers. Strong advocate for ethical AI
                    practices and responsible machine learning deployment.
                  </p>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Candidate
                  </Button>
                  <div className="text-sm text-slate-600 space-y-2">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Available for calls
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {candidate.availability}
                    </div>
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
                    <p className="text-slate-900">{candidate.experience}</p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Education:</span>
                    <p className="text-slate-900 flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      {candidate.education}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Availability:</span>
                    <p className="text-slate-900">{candidate.availability}</p>
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
