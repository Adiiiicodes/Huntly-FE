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
  rank?: string
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
 * Skill Gap Analysis Utilities
 */

const normalize = (text: string) =>
  text.toLowerCase().replace(/[.\-/\\\s]/g, '');

const SKILL_ALIASES: Record<string, string[]> = {
  'Linux/Unix': ['linux', 'unix', 'linux/unix', 'unix/linux', 'linuxunix', 'unixlinux'],
  // add other alias groups here if needed
};

const ALL_KNOWN_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'JavaScript', 'GraphQL', 'Docker', 'AWS',
  'Python', 'Java', 'SQL', 'CSS', 'HTML', 'MongoDB', 'Express', 'Vue.js',
  'Angular', 'Next.js', 'PostgreSQL', 'MySQL', 'Redis', 'Kubernetes',
  'Git', 'CI/CD', 'REST API', 'Microservices', 'Machine Learning',
  'Data Analysis', 'DevOps', 'Agile', 'Scrum', 'Flutter', 'Dart',
  'Spring Boot', 'Django', 'Flask', 'Laravel', 'PHP', 'C++', 'C#',
  ,'Rust', 'Swift', 'Kotlin', 'Terraform', 'Jenkins', 'Figma', 'Bootstrap',
  'Linux/Unix', // Use canonical skill here
];

const extractSkillsFromQuery = (query: string): string[] => {
  const queryLower = query.toLowerCase();
  const queryNormalized = normalize(query);
  const foundSkillsSet = new Set<string>();

  // Check aliases first, add canonical names if matched
  Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
    if (aliases.some(alias => queryNormalized.includes(normalize(alias)))) {
      foundSkillsSet.add(canonical);
    }
  });

  // Check all other known skills (excluding those in SKILL_ALIASES keys to avoid duplicates)
  ALL_KNOWN_SKILLS.forEach(skill => {
    if (foundSkillsSet.has(skill)) return; // already added from alias mapping

    const skillNormalized = normalize(skill);
    if (queryNormalized.includes(skillNormalized)) {
      foundSkillsSet.add(skill);
    }
  });

  // Additional skill regex patterns for common variants
  const skillPatterns = [
    { pattern: /\b(react|reactjs)\b/i, skill: 'React' },
    { pattern: /\b(node|nodejs|node\.js)\b/i, skill: 'Node.js' },
    { pattern: /\b(typescript|ts)\b/i, skill: 'TypeScript' },
    { pattern: /\b(javascript|js)\b/i, skill: 'JavaScript' },
    { pattern: /\b(python|py)\b/i, skill: 'Python' },
    { pattern: /\b(java)\b/i, skill: 'Java' },
    { pattern: /\b(postgresql|postgres)\b/i, skill: 'PostgreSQL' },
    { pattern: /\b(mysql)\b/i, skill: 'MySQL' },
    { pattern: /\b(aws|amazon web services)\b/i, skill: 'AWS' },
    { pattern: /\b(docker|containerization)\b/i, skill: 'Docker' },
    { pattern: /\b(kubernetes|k8s)\b/i, skill: 'Kubernetes' },
    { pattern: /\b(mongodb|mongo)\b/i, skill: 'MongoDB' },
    { pattern: /\b(graphql|graph ql)\b/i, skill: 'GraphQL' },
    { pattern: /\b(css)\b/i, skill: 'CSS' },
    { pattern: /\b(html)\b/i, skill: 'HTML' },
    { pattern: /\b(sql)\b/i, skill: 'SQL' },
  ];

  skillPatterns.forEach(({ pattern, skill }) => {
    if (pattern.test(queryLower)) {
      foundSkillsSet.add(skill);
    }
  });

  // Remove 'SQL' if 'PostgreSQL' or 'MySQL' found (to avoid redundant skills)
  if (foundSkillsSet.has('PostgreSQL') || foundSkillsSet.has('MySQL')) {
    foundSkillsSet.delete('SQL');
  }

  return Array.from(foundSkillsSet);
};


const calculateSkillGap = (candidateSkills: string[], desiredSkills: string[]) => {
  const candidateSkillsLower = candidateSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = desiredSkills.filter(skill => 
    candidateSkillsLower.includes(skill.toLowerCase())
  );
  
  const missingSkills = desiredSkills.filter(skill => 
    !candidateSkillsLower.includes(skill.toLowerCase())
  );

  const matchPercentage = desiredSkills.length > 0 
    ? Math.round((matchingSkills.length / desiredSkills.length) * 100)
    : 100;

  return {
    matchingSkills,
    missingSkills,
    matchPercentage,
    totalDesired: desiredSkills.length
  };
};

/**
 * Pentagonal Radar Chart Component for Skill Comparison
 */
const SkillRadarChart = ({ 
  candidateSkills, 
  desiredSkills 
}: { 
  candidateSkills: string[];
  desiredSkills: string[];
}) => {
  // Prepare data for up to 5 skills (pentagon)
  const maxSkills = 5;
  const skillsToShow = desiredSkills.slice(0, maxSkills);
  
  // Fill remaining slots if less than 5 skills
  while (skillsToShow.length < maxSkills) {
    skillsToShow.push('');
  }

  // Calculate skill levels (0-100)
  const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
  const skillLevels = skillsToShow.map(skill => {
    if (!skill) return 0;
    return candidateSkillsLower.includes(skill.toLowerCase()) ? 100 : 0;
  });

  // Pentagon coordinates (center at 120, 120, radius 80)
  const center = { x: 120, y: 120 };
  const radius = 80;
  const getCoordinates = (index: number, level: number = 100) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
    const adjustedRadius = (radius * level) / 100;
    return {
      x: center.x + adjustedRadius * Math.cos(angle),
      y: center.y + adjustedRadius * Math.sin(angle)
    };
  };

  // Generate pentagon grid lines
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPaths = gridLevels.map(level => {
    const points = Array.from({ length: 5 }, (_, i) => getCoordinates(i, level));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Generate axis lines
  const axisLines = Array.from({ length: 5 }, (_, i) => {
    const end = getCoordinates(i, 100);
    return { x1: center.x, y1: center.y, x2: end.x, y2: end.y };
  });

  // Generate candidate skill polygon
  const candidatePoints = skillLevels.map((level, index) => getCoordinates(index, level));
  const candidatePolygon = candidatePoints.map(p => `${p.x},${p.y}`).join(' ');

  // Generate required skills polygon (always 100%)
  const requiredPoints = skillsToShow.map((_, index) => getCoordinates(index, 100));
  const requiredPolygon = requiredPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center rounded-2xl p-4 shadow-md bg-gradient-to-br from-[#0f172a] to-[#1e293b] w-full max-w-md">
  <svg width="300" height="220" viewBox="0 0 240 240" className="mb-2">
    {/* Grid lines */}
    {gridPaths.map((path, index) => (
      <polygon
        key={index}
        points={path}
        fill="none"
        stroke="#334155"
        strokeWidth="1"
        opacity={0.4}
      />
    ))}

    {/* Axis lines */}
    {axisLines.map((line, index) => (
      <line
        key={index}
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke="#475569"
        strokeWidth="1"
        opacity={0.5}
      />
    ))}

    {/* Required skills polygon (Red dashed) */}
    <polygon
      points={requiredPolygon}
      fill="rgba(239, 68, 68, 0.08)"
      stroke="rgb(239, 68, 68)"
      strokeWidth="2"
      strokeDasharray="4,3"
    />

    {/* Candidate skills polygon (Blue solid) */}
    <polygon
      points={candidatePolygon}
      fill="rgba(59, 130, 246, 0.2)"
      stroke="rgb(59, 130, 246)"
      strokeWidth="2"
    />

    {/* Skill labels + points */}
    {skillsToShow.map((skill, index) => {
      if (!skill) return null;
      const labelPos = getCoordinates(index, 110);
      const hasSkill = candidateSkillsLower.includes(skill.toLowerCase());
      const point = getCoordinates(index, skillLevels[index]);

      return (
        <g key={index}>
          {/* Point with slight glow */}
          <circle
            cx={point.x}
            cy={point.y}
            r="3.5"
            fill={hasSkill ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)"}
            stroke="white"
            strokeWidth="0.5"
            opacity={0.9}
          />
          <circle
            cx={point.x}
            cy={point.y}
            r="6"
            fill={hasSkill ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)"}
            opacity={0.12}
          />

          {/* Skill label */}
          <text
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: '10px', fill: '#cbd5e1', fontWeight: 500 }}
          >
            {skill}
          </text>
        </g>
      );
    })}

    {/* Center dot */}
    <circle cx={center.x} cy={center.y} r="2" fill="#94a3b8" />
  </svg>

  {/* Legend */}
  <div className="flex items-center gap-5 text-xs text-slate-300">
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
      <span>Has Skill</span>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-2.5 h-2.5 border border-red-500 border-dashed rounded-full"></div>
      <span>Required</span>
    </div>
  </div>
</div>

  )
};

/**
 * Skill Gap Analysis Component (Simplified for sidebar)
 */
const SkillGapAnalysis = ({ 
  candidateSkills, 
  desiredSkills 
}: { 
  candidateSkills: string[];
  desiredSkills: string[];
}) => {
  const skillGap = calculateSkillGap(candidateSkills, desiredSkills);

  if (desiredSkills.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Skill Analysis</h4>
        <p className="text-xs text-gray-600">No specific skills detected in query</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 text-sm">Skill Gap Analysis</h4>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${
            skillGap.matchPercentage >= 80 ? 'bg-green-500' :
            skillGap.matchPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs font-medium text-gray-700">
            {skillGap.matchPercentage}%
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-4">
        <SkillRadarChart 
          candidateSkills={candidateSkills}
          desiredSkills={desiredSkills}
        />
      </div>

      {/* Matching Skills */}
      {skillGap.matchingSkills.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-green-700 mb-1">✓ Has Skills</p>
          <div className="flex flex-wrap gap-1">
            {skillGap.matchingSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {skillGap.missingSkills.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-700 mb-1">✗ Missing Skills</p>
          <div className="flex flex-wrap gap-1">
            {skillGap.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Skills */}
      {desiredSkills.length > 5 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">Additional Required</p>
          <div className="flex flex-wrap gap-1">
            {desiredSkills.slice(5).map((skill, index) => (
              <span
                key={index}
                className={`px-1 py-0.5 rounded text-xs font-medium ${
                  candidateSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Render a single candidate card with skill gap analysis on the right
 */
const CandidateCard = ({
  candidate,
  rank,
  desiredSkills = [],
}: {
  candidate: Candidate;
  rank?: string;
  desiredSkills?: string[];
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-6 overflow-hidden">
      <div className="flex">
        {/* Main candidate info - Left side */}
        <div className="flex-1 p-6">
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
                <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">
                  Location:
                </p>
                <p className="text-gray-800 font-medium">{candidate.location}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">
                  Experience:
                </p>
                <p className="text-gray-800 font-medium">{candidate.experience_years} years</p>
              </div>
            </div>
          </div>

          {candidate.experience && (
            <div className="mb-6">
              <p className="text-sm text-[#242229] underline font-semibold uppercase tracking-wide">
                Background:
              </p>
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

        {/* Skill Gap Analysis - Right side */}
        <div className="w-80 bg-gray-50 p-6 border-l flex-shrink-0">
          <SkillGapAnalysis 
            candidateSkills={candidate.skills}
            desiredSkills={desiredSkills}
          />
        </div>
      </div>
    </div>
  );
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

  // Extract desired skills from query
  const desiredSkills = extractSkillsFromQuery(query);

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

  return (
    <div className="min-h-screen bg-[#e0e2e4] px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#242229]">
              Results for &quot;{query}&quot;
            </h1>
            {desiredSkills.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Analyzing for skills: </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {desiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-accent/20 text-[#242229] px-2 py-1 rounded text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
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
                      {rankedData.data.map((candidate, index) => (
                        <CandidateCard 
                          key={`ranked-${candidate.id}-${index}`}
                          candidate={candidate} 
                          rank={candidate.rank || String(index + 1)}
                          desiredSkills={desiredSkills}
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
                          key={`original-${candidate.id}-${index}`}
                          candidate={candidate} 
                          desiredSkills={desiredSkills}
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