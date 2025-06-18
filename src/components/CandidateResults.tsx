'use client';

import React from 'react';
import { Candidate } from '@/types/candidate';
import CandidateCard from './CandidateCard';
import SearchAnalytics from './SearchAnalytics';
import { Button } from '@/components/ui/button';

interface CandidateResultsProps {
  candidates: Candidate[];
  isLoading: boolean;
  searchQuery: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const CandidateResults: React.FC<CandidateResultsProps> = ({
  candidates,
  isLoading,
  searchQuery,
  onLoadMore,
  hasMore = false,
}) => {
  if (isLoading && candidates.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white rounded-full shadow-lg">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg font-medium text-slate-700">
              AI is analyzing your requirements...
            </span>
          </div>
          <p className="text-slate-600 mt-4">This may take a few moments</p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-4 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded" />
                    <div className="h-4 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (candidates.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Search Results</h3>
        <p className="text-slate-600">
          Found {candidates.length} candidates matching &quot;{searchQuery}&quot;
        </p>
      </div>

      {/* Analytics Section */}
      <SearchAnalytics candidates={candidates} />

      {/* Candidates List */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Candidate Profiles</h3>
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={false}
              onToggleSelect={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Load More Section */}
      {candidates.length > 0 && (
        <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-sm">
          <p className="text-slate-600 mb-4">
            {hasMore
              ? 'Want to see more candidates or refine your search?'
              : "You've seen all available candidates for this search."}
          </p>
          <div className="flex justify-center space-x-4">
            {hasMore && (
              <Button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading More...</span>
                  </div>
                ) : (
                  'Load More Results'
                )}
              </Button>
            )}
            <Button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Refine Search
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateResults;
