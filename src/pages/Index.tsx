'use client';

import React, { useState, useEffect, Suspense } from 'react';
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

const IndexPageContent = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  
  // Use URL params without useSearchParams hook
  const getQueryParam = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('query') || '';
    }
    return '';
  };
  
  const [query, setQuery] = useState(getQueryParam());
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Authentication check effect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      checkAuth(window.location.pathname);
    }
  }, [isAuthenticated, isLoading, checkAuth]);

  // Load search results when page loads or URL changes
  useEffect(() => {
    const urlQuery = getQueryParam();
    if (urlQuery) {
      setQuery(urlQuery);
      if (candidates.length === 0 || urlQuery !== query) {
        performSearch(urlQuery, false);
      }
    }
  }, [candidates.length, query]);

  // Show loading state during authentication check
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-lg">
          <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (we're redirecting)
  if (!isAuthenticated) {
    return null;
  }

  const performSearch = async (searchQuery: string, updateUrl = true) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await candidateService.searchCandidates(searchQuery);

      const fixedResults = results.map((candidate, index) => ({
        ...candidate,
        _id: candidate._id || candidate.id || `fallback-${index}`,
      }));

      if (updateUrl) {
        const params = new URLSearchParams();
        params.set('query', searchQuery);
        router.replace(`/?${params.toString()}`, { scroll: false });
      }

      setCandidates(fixedResults);
      setShowAnalytics(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAISearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const initialResponse = `These are some candidates based on the query: "${query}"`;
      const results = await rankService.rankCandidates(query, initialResponse);

      const fixedResults = results.map((candidate, index) => ({
        ...candidate,
        _id: candidate._id || candidate.id || `fallback-${index}`,
      }));

      const params = new URLSearchParams();
      params.set('query', query);
      router.replace(`/?${params.toString()}`, { scroll: false });

      setCandidates(fixedResults);
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
    performSearch(query.trim());
  };

  const toggleSelectCandidate = (id: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    const queryParams = new URLSearchParams();
    selectedCandidates.forEach((id) => queryParams.append('id', id));
    queryParams.append('query', query);
    router.push(`/compare?${queryParams.toString()}`);
  };

  const exampleQueries = [
    'Senior Gen-AI engineer, Europe, contract based',
    'Full-stack developer with React, 3+ years, remote',
    'Data scientist with Python and ML experience, US',
    'DevOps engineer, AWS certified, permanent role',
  ];
  return (
    <div className="max-w-7xl mx-auto mb-16 px-2 sm:px-4 relative">
      {/* Hero Section */}
      {candidates.length === 0 && !isSearching && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_0)] bg-[length:24px_24px]" />
          </div>

          <div className="container mx-auto px-2 sm:px-6 py-10 md:py-20 relative z-10">
            <div className="text-center mb-10 md:mb-20 animate-fade-in">
              <div className="mb-6 md:mb-8">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-black mb-4 leading-tight">
                  Discover Top Talent
                  <br />
                  <span className="text-2xl sm:text-4xl md:text-5xl bg-gradient-to-r from-gray-600 to-black bg-clip-text text-transparent">
                    with AI Precision
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Harness the power of artificial intelligence to find the perfect candidates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10 md:mb-20">
                {[
                  {
                    icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />,
                    title: 'AI-Powered Matching',
                    desc: 'Advanced algorithms analyze skills, experience, and cultural fit',
                  },
                  {
                    icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />,
                    title: 'Instant Results',
                    desc: 'Get matched candidates in seconds with our fast search',
                  },
                  {
                    icon: <Target className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />,
                    title: 'Precision Targeting',
                    desc: 'Natural language search understands your needs',
                  },
                  {
                    icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />,
                    title: 'Global Talent Pool',
                    desc: 'Access verified professionals globally',
                  },
                ].map(({ icon, title, desc }, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      {icon}
                    </div>
                    <h3 className="font-bold text-black mb-2 sm:mb-3 text-base sm:text-lg">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-black text-white rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-12 mb-10 md:mb-20">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">2000+</div>
                    <div className="text-gray-300 text-sm sm:text-base md:text-lg">Verified Candidates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">98%</div>
                    <div className="text-gray-300 text-sm sm:text-base md:text-lg">Match Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">1.1s</div>
                    <div className="text-gray-300 text-sm sm:text-base md:text-lg">Avg. Search Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">500+</div>
                    <div className="text-gray-300 text-sm sm:text-base md:text-lg">Companies Trust Us</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-12 text-gray-400 mb-10 md:mb-20">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Verified Profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Top 1% Talent</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Global Network</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full mb-4 sm:mb-6">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">AI-Powered Search</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight">
          Find Your Perfect <br />
          <span className="bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">Candidate</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Use natural language to describe your ideal candidate. Our AI will find the best matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        {isSearching && (
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4 px-3 py-2 sm:px-4 sm:py-3 bg-gray-100 border border-gray-200 rounded-lg sm:rounded-xl animate-pulse">
            <Sparkles className="text-gray-500 w-4 h-4" />
            <span className="text-sm sm:text-base text-gray-600 font-medium">AI is analyzing your query...</span>
          </div>
        )}
        <div className="relative group">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your ideal candidate..."
            className="min-h-[100px] sm:min-h-[120px] md:min-h-[140px] text-base sm:text-lg px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 pr-24 sm:pr-32 border-2 border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl resize-none bg-white shadow-lg transition-all duration-300 placeholder:text-gray-400 text-black"
            disabled={isSearching}
          />
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-6 md:right-6 bg-black hover:bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
          >
            {isSearching ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Search className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                <span>Search</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      <div className="text-center mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button
            onClick={handleAISearch}
            //disabled={isSearching || !query.trim()}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Ranked Search
          </Button>
          <Button
            onClick={handleAnalyticsSearch}
            //disabled={isSearching || !query.trim() || candidates.length === 0}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm mt-2 sm:mt-0 sm:ml-4"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Search Analytics
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 font-medium">Try these example searches:</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => performSearch(example)}
              className="group px-3 py-1 sm:px-4 sm:py-2 md:px-6 md:py-3 bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              disabled={isSearching}
              type="button"
            >
              <span className="group-hover:font-medium transition-all duration-200">
                {example.length > 30 ? `${example.substring(0, 30)}...` : example}
              </span>
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
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {candidates.map((candidate, index) => (
            <div
              key={candidate._id || `fallback-${index}`}
              onClick={() => {
                router.push(`/candidate/${candidate._id}?query=${encodeURIComponent(query)}`);
              }}
              className="cursor-pointer"
            >
              <CandidateCard
                candidate={candidate}
                isSelected={selectedCandidates.includes(candidate._id)}
                onToggleSelect={(id, e) => {
                  e.stopPropagation();
                  toggleSelectCandidate(id);
                }}
              />
            </div>
          ))}
        </div>
      )}

      {!showAnalytics && selectedCandidates.length >= 2 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={handleCompare}
            className="bg-black text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:bg-gray-800 text-xs sm:text-sm"
          >
            Compare {selectedCandidates.length} Candidates
          </Button>
        </div>
      )}
    </div>
  );
};

const IndexPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <IndexPageContent />
    </Suspense>
  );
};

export default IndexPage;