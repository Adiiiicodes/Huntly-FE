'use client';

import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type Candidate = {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  skills: string[];
  rating: number;
  availability: string;
  avatar: string;
  hourlyRate: string;
};

const TopCandidates: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to view candidate profiles.",
      });
      router.push('/login');
    }
  };

  const topCandidates: Candidate[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior AI Engineer',
      location: 'Berlin, Germany',
      experience: '6 years',
      skills: ['Python', 'TensorFlow', 'NLP'],
      rating: 4.9,
      availability: 'Available',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b586?w=150&h=150&fit=crop&crop=face',
      hourlyRate: '€85-100/hour',
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'AI Research Engineer',
      location: 'Amsterdam, Netherlands',
      experience: '8 years',
      skills: ['JAX', 'Research', 'LLMs'],
      rating: 4.8,
      availability: 'Available',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      hourlyRate: '€90-110/hour',
    },
    {
      id: '3',
      name: 'Elena Kowalski',
      title: 'Generative AI Engineer',
      location: 'London, UK',
      experience: '5 years',
      skills: ['OpenAI API', 'RAG', 'Fine-tuning'],
      rating: 4.9,
      availability: 'Available',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      hourlyRate: '€75-95/hour',
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">Top Rated Candidates</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our highest-rated AI professionals ready to transform your projects
          </p>
          {!isAuthenticated && (
            <p className="text-sm text-red-500 mt-2">
              Please login to view candidate profiles
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {topCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
                    }}
                  />
                  <div>
                    <h3 className="font-semibold text-black">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-black text-white px-2 py-1 rounded-full text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{candidate.rating}</span>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {candidate.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {candidate.experience} experience
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Skills: </span>
                  <span className="font-medium text-black">{candidate.skills.join(', ')}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Rate: </span>
                  <span className="font-semibold text-black">{candidate.hourlyRate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                  onClick={handleAuthRequired}
                >
                  View Profile
                </Button>
                <Button 
                  className="bg-black text-white hover:bg-gray-800 px-6"
                  onClick={handleAuthRequired}
                >
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg"
            onClick={handleAuthRequired}
          >
            Browse All Candidates
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TopCandidates;
