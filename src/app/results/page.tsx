'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Define candidate interface
interface Candidate {
  id: string
  name: string
  location: string
  skills: string[]
  experience?: string
  experience_years: number
  relevance_score?: number
}

// Define the response type from the RAG service
interface RAGResponse {
  answer: string // JSON-formatted response
  context?: string // Context used to generate the response
  cached: boolean // Whether the response came from cache
}

// Define the chat response data structure
interface CandidateSearchResult {
  candidates: Candidate[]
  summary: string
}

// Define the ranking response type
interface RankingResponse {
  success: boolean
  data: Candidate[]
}

/**
 * Fetches candidate data from the chat API
 */
const fetchCandidatesData = async (query: string): Promise<RAGResponse> => {
  console.log('Fetching candidates with query:', query);

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ question: query })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Chat API Error:', errorText);
    throw new Error(`Failed to fetch candidates: ${response.status}`);
  }

  return response.json();
};

/**
 * Fetches ranked analysis of candidates
 */
const fetchRankedAnalysis = async (query: string, initialResponse: string): Promise<RankingResponse> => {
  console.log('Fetching ranked analysis for query:', query);
  console.log('Initial response length:', initialResponse.length);

  try {
    const response = await fetch('/api/ranker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        initialResponse
      })
    });

    console.log('Ranking response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ranking API Error:', errorText);
      throw new Error(`Failed to fetch ranked analysis: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Ranking data received with candidates:', data.data?.length || 0);
    
    return {
      success: data.success || false,
      data: Array.isArray(data.data) ? data.data.map(candidate => ({
        id: candidate.id || 'unknown',
        rank: candidate.rank || '0',
        name: candidate.name || 'Not specified',
        location: candidate.location || 'Not specified',
        skills: Array.isArray(candidate.skills) ? candidate.skills : [],
        experience_years: candidate.experience_years || 0
      })) : []
    };
  } catch (error) {
    console.error('Error in fetchRankedAnalysis:', error);
    throw error;
  }
};

/**
 * Main ResultsPage component with Suspense
 */
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#e0e2e4] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}

/**
 * Results content component
 */
function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')?.toLowerCase() || ''
  const [candidateData, setCandidateData] = useState<CandidateSearchResult | null>(null)
  const [rankedData, setRankedData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rankingError, setRankingError] = useState<string | null>(null)
  const [showRanked, setShowRanked] = useState(false)
  const [originalResponse, setOriginalResponse] = useState('')

  // Load candidates on initial render or query change
  useEffect(() => {
    const loadCandidates = async () => {
      if (!query) {
        setCandidateData({
          candidates: [],
          summary: 'Please provide a search query.'
        })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Starting search for:', query);

        const result = await fetchCandidatesData(query)
        console.log('Search result received, content length:', result.answer?.length || 0);

        // Parse the JSON response
        try {
          const parsedData = JSON.parse(result.answer) as CandidateSearchResult;
          setCandidateData(parsedData);
          setOriginalResponse(result.answer); // Store original response for ranking
          setError(null);
        } catch (parseError) {
          console.error('Error parsing candidate data:', parseError);
          setError('Failed to parse candidate data. Please try again.');
          setCandidateData({
            candidates: [],
            summary: 'Error parsing results.'
          });
        }
      } catch (err) {
        console.error('Error fetching candidates:', err)
        setError('Failed to load candidates. Please try again.')
        setCandidateData({
          candidates: [],
          summary: 'Error loading results.'
        })
      } finally {
        setLoading(false)
      }
    }

    loadCandidates()
  }, [query])

  /**
   * Handle ranked analysis request
   */
  const handleGetRankedAnalysis = async () => {
    if (!originalResponse || !query) {
      setRankingError('No data available for ranking analysis.')
      return
    }

    try {
      setRankingLoading(true)
      setRankingError(null)
      console.log('Getting ranked analysis...');

      const rankingResult = await fetchRankedAnalysis(query, originalResponse)
      console.log('Ranking result received with candidates:', rankingResult.data.length);

      setRankedData(rankingResult)
      setShowRanked(true)
    } catch (err) {
      console.error('Error fetching ranked analysis:', err)
      setRankingError('Failed to generate ranked analysis. Please try again.')
    } finally {
      setRankingLoading(false)
    }
  }

  /**
   * Toggle between ranked and original view
   */
  const toggleView = () => {
    setShowRanked(!showRanked)
  }

  /**
   * Render a single candidate card
   */
  const CandidateCard = ({ candidate, rank }: { candidate: Candidate, rank?: string }) => {
    return (
      <div className="candidate-card bg-accent/30 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-[#242229] mb-2">
              {candidate.name !== 'Not specified' ? candidate.name : `Candidate ${candidate.id}`}
            </h3>
            <div className="flex items-center gap-2">
              {rank && (
                <span className="bg-gradient-to-r from-accent/50 to-[#242229] text-[#e0e2e4] px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  Rank #{rank}
                </span>
              )}
              {candidate.relevance_score !== undefined && (
                <span className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                  Score: {candidate.relevance_score}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">Location:</p>
              <p className="text-gray-800 font-medium">{candidate.location}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">Experience:</p>
              <p className="text-gray-800 font-medium">{candidate.experience_years} years</p>
            </div>
          </div>
        </div>
        
        {candidate.experience && (
          <div className="mb-6">
            <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">Background:</p>
            <p className="text-gray-800">{candidate.experience}</p>
          </div>
        )}
        
        <div className="border-t pt-6">
          <p className="text-lg font-semibold text-gray-800 mb-4">Skills & Expertise</p>
          <div className="flex flex-wrap gap-3">
            {candidate.skills.map((skill, index) => (
              <span 
                key={index}
                className="bg-gradient-to-r from-[#e0e2e4] to-gray-100 text-[#242229] px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:shadow-md transition-shadow"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#e0e2e4] px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242229]">
            Results for &quot;{query}&quot;
          </h1>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-600">Searching candidates...</span>
          </div>
        ) : (
          <>
            {/* Error messages */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {rankingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {rankingError}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mb-6">
              {!showRanked && (
                <button
                  onClick={handleGetRankedAnalysis}
                  disabled={rankingLoading || !originalResponse}
                  className="text-md font-semibold bg-accent text-[#e0e2e4] px-4 py-3 rounded hover:bg-[#242229] transition text-center flex items-center gap-2"
                >
                  {rankingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Generating Analysis...
                    </>
                  ) : (
                    'Get Ranked Analysis'
                  )}
                </button>
              )}

              <Link
                href="/"
                className="text-md font-semibold bg-[#242229] text-[#e0e2e4] px-4 py-3 rounded hover:bg-[#242229]/20 transition text-center"
              >
                Back to Home
              </Link>

              <Link
                href={`/dashboard?query=${encodeURIComponent(query)}`}
                className="text-md font-semibold bg-[#242229] text-[#e0e2e4] px-4 py-3 rounded hover:bg-[#242229]/20 transition text-center"
              >
                Analytics Dashboard
              </Link>

              {rankedData && (
                <button
                  onClick={toggleView}
                  className="text-md font-semibold bg-accent/40 text-[#242229] px-4 py-3 rounded hover:bg-[#242229]/50 transition text-center"
                >
                  {showRanked ? 'Show Original Results' : 'Show Ranked Analysis'}
                </button>
              )}
            </div>

            {/* Content display */}
            <div className="min-h-[400px]">
              {showRanked && rankedData ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-gradient-to-r from-accent to-[#242229] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Ranked Analysis Results</h2>
                  </div>
                  
                  {rankedData.data.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No ranked candidates available.</p>
                  ) : (
                    <div className="ranked-results">
                      {rankedData.data.map((candidate) => (
                        <CandidateCard 
                          key={candidate.id} 
                          candidate={candidate} 
                          rank={candidate.rank} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-[#242229] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
                  </div>
                  
                  {candidateData?.summary && (
                    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-700">{candidateData.summary}</p>
                    </div>
                  )}
                  
                  {!candidateData || candidateData.candidates.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No candidates found matching your criteria.</p>
                  ) : (
                    <div className="candidates-list">
                      {candidateData.candidates.map((candidate, index) => (
                        <CandidateCard 
                          key={candidate.id || index} 
                          candidate={candidate} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}