'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Define the response type from the RAG service
interface RAGResponse {
  answer: string // HTML-formatted response
  context?: string // Context used to generate the response
  cached: boolean // Whether the response came from cache
}

// Define the ranking response type
interface RankingResponse {
  success: boolean
  data: Array<{
    id: string
    rank: string
    name: string
    location: string
    skills: string[]
    experience_years: number
  }>
}

// Fixed fetch function to match backend expectations
const fetchCandidatesHTML = async (query: string): Promise<RAGResponse> => {
  console.log('Fetching with query:', query);
  
  // Updated URL path to /api/chat to match the router mounting 
  const apiUrl = process.env.API_BASE_URL || 'https://e9b6-182-48-219-59.ngrok-free.app'
  const response = await fetch(`${apiUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // Updated to use "question" instead of "query" to match backend expectation
    body: JSON.stringify({ question: query })
  })
  
  if (!response.ok) {
    throw new Error(`Failed to fetch candidate HTML: ${response.status}`)
  }
  return response.json()
}

// Updated function to fetch ranked analysis with correct parameters
const fetchRankedAnalysis = async (query: string, initialResponse: string): Promise<RankingResponse> => {
  console.log('Fetching ranked analysis for query:', query);
  console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
  
  // Construct URL with query parameters as specified
  const params = new URLSearchParams({
    initialResponse: initialResponse,  // Changed from 'response' to 'initialResponse'
    query: query                      // This matches your specification
  })
  

  const apiUrl = process.env.API_BASE_URL || 'https://e9b6-182-48-219-59.ngrok-free.app'
  const url = `${apiUrl}/api/ranker?${params}`
  console.log('Full ranking URL:', url);
  
  const rankingResponse = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'  // Updated to match your header specification
    }
  })
  
  console.log('Ranking response status:', rankingResponse.status);
  console.log('Ranking response ok:', rankingResponse.ok);
  
  if (!rankingResponse.ok) {
    // Log more details about the error
    const errorText = await rankingResponse.text();
    console.error('Ranking API Error Response:', errorText);
    throw new Error(`Failed to fetch ranked analysis: ${rankingResponse.status} - ${errorText}`)
  }
  
  return rankingResponse.json()
}

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

function ResultsContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')?.toLowerCase() || ''
  const [htmlContent, setHtmlContent] = useState('')
  const [rankedData, setRankedData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [rankingLoading, setRankingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rankingError, setRankingError] = useState<string | null>(null)
  const [showRanked, setShowRanked] = useState(false)
  const [originalResponse, setOriginalResponse] = useState('')

  // Function to render ranked candidate data
  const renderRankedCandidates = (data: RankingResponse) => {
    if (!data.success || !data.data.length) {
      return '<p class="text-center text-gray-600 py-8">No ranked candidates available.</p>'
    }

    return data.data.map(candidate => `
      <div class="candidate-card bg-accent/30 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300  mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-2xl font-bold text-[#242229] mb-2">
              ${candidate.name !== 'Not specified' ? candidate.name : 'Candidate ' + candidate.id}
            </h3>
            <div class="flex items-center gap-2">
              <span class="bg-gradient-to-r from-accent/50 to-[#242229] text-[#e0e2e4] px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                Rank #${candidate.rank}
              </span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-3">
            <div>
              <p class="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">Location:</p>
              <p class="text-gray-800 font-medium">${candidate.location}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div>
              <p class="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">Experience:</p>
              <p class="text-gray-800 font-medium">${candidate.experience_years} years</p>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-6">
          <p class="text-lg font-semibold text-gray-800 mb-4">Skills & Expertise</p>
          <div class="flex flex-wrap gap-3">
            ${candidate.skills.map(skill => 
              `<span class="bg-gradient-to-r from-[#e0e2e4] to-gray-100 text-[#242229] px-4 py-2 rounded-full text-sm font-medium border border-gray-200 hover:shadow-md transition-shadow">${skill}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `).join('')
  }

  const renderOriginalContent = (htmlContent: string) => {
    if (!htmlContent) return ''
    
    const candidatePattern = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>|<strong>([^<]+)<\/strong>|<b>([^<]+)<\/b>/gi
    const matches = Array.from(htmlContent.matchAll(candidatePattern))
    
    if (matches.length > 1) {
      const sections = htmlContent.split(/(?=<h[1-6])|(?=<strong>[^<]*(?:candidate|name|profile))/gi)
        .filter(section => {
          const trimmed = section.trim()
          // Filter out short sections and common header fragments
          return trimmed.length > 50 && 
                 !trimmed.includes('Here are the') &&
                 !trimmed.includes('candidates-list') &&
                 !trimmed.includes('match your query') &&
                 !trimmed.startsWith('candidate">') &&
                 trimmed.includes('<') // Must contain actual HTML tags
        })
      
      if (sections.length > 1) {
        return sections.map((section, index) => `
          <div class="candidate-card bg-accent/30 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6">
            <div class="prose max-w-none">
              ${section.replace(/(candidate|name|profile)/gi, '<strong class="text-xl font-bold text-[#242229]">$1</strong>')}
            </div>
          </div>
        `).join('')
      }
    }
    
    return `
      <div class="p-8 rounded-xl shadow-lg">
        <div class="prose max-w-none text-[#242229]">
          ${htmlContent.replace(/(<h[1-6][^>]*>)/gi, '$1<span class="font-bold">')}
        </div>
      </div>
    `
}

  const splitCandidatesHTML = (htmlString: string) => {
    if (!htmlString) return []
    
    // Split by common candidate separators or patterns
    // This is a simple approach - you might need to adjust based on your HTML structure
    const candidateBlocks = htmlString.split(/(?=<h[1-6])|(?=<div.*?class.*?candidate)|(?=<article)|(?=<section)/)
      .filter(block => block.trim().length > 0)

      return candidateBlocks.map((block, index) => ({
      id: index,
      html: block.trim()
    }))
  }

  useEffect(() => {
    const loadCandidates = async () => {
      if (!query) {
        setHtmlContent('<p>Please provide a search query.</p>')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log('Starting search for:', query);
        
        const result = await fetchCandidatesHTML(query)
        console.log('Search result received:', { 
          cached: result.cached, 
          contentLength: result.answer?.length || 0 
        });
        
        setHtmlContent(result.answer)
        setOriginalResponse(result.answer) // Store original response for ranking
        setError(null)
      } catch (err) {
        console.error('Error fetching candidates:', err)
        setError('Failed to load candidates. Please try again.')
        setHtmlContent('<p>Failed to load content.</p>')
      } finally {
        setLoading(false)
      }
    }

    loadCandidates()
  }, [query])

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
      console.log('Ranking result received:', rankingResult);
      
      setRankedData(rankingResult)
      setShowRanked(true)
    } catch (err) {
      console.error('Error fetching ranked analysis:', err)
      setRankingError('Failed to generate ranked analysis. Please try again.')
    } finally {
      setRankingLoading(false)
    }
  }

  const toggleView = () => {
    setShowRanked(!showRanked)
  }

  return (
    <div className="min-h-screen bg-[#e0e2e4] px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242229]">
            Results for &quot;{query}&quot;
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            <span className="ml-3 text-gray-600">Searching candidates...</span>
          </div>
        ) : (
          <>
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
                  <div
                    className="ranked-results"
                    dangerouslySetInnerHTML={{ __html: renderRankedCandidates(rankedData) }}
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-4 h-4 bg-[#242229] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
                  </div>
                  <div
                    className="original-results"
                    dangerouslySetInnerHTML={{ __html: renderOriginalContent(htmlContent) }}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}