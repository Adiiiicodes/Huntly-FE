'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Sparkles,
  Brain,
  Zap,
  Target,
  Users,
  Shield,
  Award,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { candidateService } from '@/services/candidateService';
import { rankService } from '@/services/rankService';
import { Candidate } from '@/types/candidate';
import CandidateCard from '@/components/CandidateCard';
import SearchAnalytics from '@/components/SearchAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const IndexPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleSearch = async (query: string) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to use the search feature.",
      });
      router.push('/login');
      return;
    }

    setIsSearching(true);
    const results = await candidateService.searchCandidates(query);
    setCandidates(results);
    setIsSearching(false);
    setShowAnalytics(false);
  };

  const handleAISearch = async () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to use the AI search feature.",
      });
      router.push('/login');
      return;
    }

    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const initialResponse = `These are some candidates based on the query: "${query}"`;
      const results = await rankService.rankCandidates(query, initialResponse);
      setCandidates(results);
      setShowAnalytics(false);
    } catch (error) {
      console.error('AI Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyticsSearch = () => {
    setShowAnalytics(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query.trim());
    }
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    const query = selectedCandidates.map((id) => `id=${id}`).join('&');
    router.push(`/compare?${query}`);
  };

  const exampleQueries = [
    'Senior Gen-AI engineer, Europe, contract based',
    'Full-stack developer with React, 3+ years, remote',
    'Data scientist with Python and ML experience, US',
    'DevOps engineer, AWS certified, permanent role',
  ];

  return (
    <div className="max-w-7xl mx-auto mb-16 px-4 relative">
      {/* Hero Section */}
      {candidates.length === 0 && !isSearching && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_0)] bg-[length:24px_24px]" />
          </div>

          <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="text-center mb-20 animate-fade-in">
              <div className="mb-8">
                <h1 className="text-7xl font-bold text-black mb-6 leading-tight">
                  Discover Top Talent
                  <br />
                  <span className="text-6xl bg-gradient-to-r from-gray-600 to-black bg-clip-text text-transparent">
                    with AI Precision
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Harness the power of artificial intelligence to find the perfect candidates.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-20">
                {[
                  {
                    icon: <Brain className="w-7 h-7 text-white" />,
                    title: 'AI-Powered Matching',
                    desc: 'Advanced algorithms analyze skills, experience, and cultural fit',
                  },
                  {
                    icon: <Zap className="w-7 h-7 text-white" />,
                    title: 'Instant Results',
                    desc: 'Get matched candidates in seconds with our fast search',
                  },
                  {
                    icon: <Target className="w-7 h-7 text-white" />,
                    title: 'Precision Targeting',
                    desc: 'Natural language search understands your needs',
                  },
                  {
                    icon: <Users className="w-7 h-7 text-white" />,
                    title: 'Global Talent Pool',
                    desc: 'Access verified professionals globally',
                  },
                ].map(({ icon, title, desc }, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
                      {icon}
                    </div>
                    <h3 className="font-bold text-black mb-3 text-lg">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-black text-white rounded-3xl p-12 mb-20">
                <div className="grid md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-3">{candidates.length}+</div>
                    <div className="text-gray-300 text-lg">Verified Candidates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-3">98%</div>
                    <div className="text-gray-300 text-lg">Match Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-3">2.3s</div>
                    <div className="text-gray-300 text-lg">Avg. Search Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-3">500+</div>
                    <div className="text-gray-300 text-lg">Companies Trust Us</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center items-center space-x-12 text-gray-400 mb-20">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified Profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">Top 1% Talent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium">Global Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">AI-Powered Search</span>
        </div>
        <h2 className="text-5xl font-bold text-black mb-6 leading-tight">
          Find Your Perfect <br />
          <span className="bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">Candidate</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Use natural language to describe your ideal candidate. Our AI will find the best matches.
        </p>
        {!isAuthenticated && (
          <p className="text-sm text-red-500 mt-2">
            Please login to use the search feature
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <Textarea
            placeholder="Describe your ideal candidate (e.g., 'Senior React developer with 5+ years experience in fintech')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-4 pr-32 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 resize-none"
            rows={3}
            disabled={!isAuthenticated}
          />
          <Button
            type="submit"
            className="absolute right-2 bottom-2 bg-black text-white hover:bg-gray-800"
            disabled={!isAuthenticated || isSearching}
          >
            {isSearching ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center mb-8">
        <Button
          onClick={handleAISearch}
          disabled={isSearching || !query.trim()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Powered Search
        </Button>
        <Button
          onClick={handleAnalyticsSearch}
          disabled={isSearching || !query.trim() || candidates.length === 0}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ml-4"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Search Analytics
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4 font-medium">Try these example searches:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setQuery(example);
                handleSearch(example);
              }}
              className="group px-6 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              disabled={isSearching}
              type="button"
            >
              <span className="group-hover:font-medium transition-all duration-200">"{example}"</span>
            </button>
          ))}
        </div>
      </div>

      {showAnalytics && candidates.length > 0 && (
        <SearchAnalytics 
          candidates={candidates} 
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {!showAnalytics && candidates.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.id)}
              onToggleSelect={() => toggleSelectCandidate(candidate.id)}
            />
          ))}
        </div>
      )}

      {!showAnalytics && selectedCandidates.length >= 2 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleCompare}
            className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800"
          >
            Compare {selectedCandidates.length} Candidates
          </Button>
        </div>
      )}
    </div>
  );
};

export default IndexPage;