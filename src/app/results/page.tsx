'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// Define the response type from the RAG service
interface RAGResponse {
  answer: string // HTML-formatted response
  context?: string // Context used to generate the response
  cached: boolean // Whether the response came from cache
}

// ✅ Proper fetch function with template literals
const fetchCandidatesHTML = async (query: string): Promise<RAGResponse> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/phase1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch candidate HTML: ${response.status}`)
  }

  return response.json()
}

export default function ResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('query')?.toLowerCase() || ''

  const [htmlContent, setHtmlContent] = useState('')
  const [cacheInfo, setCacheInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCandidates = async () => {
      if (!query) {
        setHtmlContent('<p>Please provide a search query.</p>')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await fetchCandidatesHTML(query)
        setHtmlContent(result.answer)
        setCacheInfo(
          result.cached
            ? `Results from cache${result.context ? `: ${result.context}` : '.'}`
            : null
        )
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

  return (
    <div className="min-h-screen bg-[#e0e2e4] px-4 sm:px-6 lg:px-8">
      <main className="max-w-6xl mx-auto py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#242229]">
            Results for "{query}"
          </h1>
          <Link
            href="/"
            className="text-md font-semibold bg-accent text-[#e0e2e4] px-4 py-3 rounded hover:bg-[#242229] transition text-center"
          >
            Back to Home
          </Link>
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

            {cacheInfo && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg mb-4 text-sm">
                {cacheInfo}
              </div>
            )}

            <div
              className="prose max-w-none text-[#3a4144] bg-white p-6 rounded-2xl shadow"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </>
        )}
      </main>
    </div>
  )
}
