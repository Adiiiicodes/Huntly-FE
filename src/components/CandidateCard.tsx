import React from 'react';
import Link from 'next/link';
import { Candidates } from '../types/candidate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CandidateCardProps {
  candidate: Candidates;
  isSelected: boolean;
  onToggleSelect: (candidate: Candidates) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, isSelected, onToggleSelect }) => {
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatExperience = (exp: number | string | undefined) => {
    if (typeof exp === 'number') {
      if (exp < 1) return `${Math.round(exp * 12)} months`;
      return `${exp.toFixed(1)} years`;
    }
    return exp || 'N/A';
  };

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 ${
        isSelected ? 'border-l-green-600 bg-green-50' : 'border-l-blue-500'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(candidate)}
            className="mt-2"
          />
          <img
            src={
              candidate.avatar ||
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
            }
            alt={candidate.fullName || 'Candidate'}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
            }}
          />
          <div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">
              {candidate.fullName || 'N/A'}
            </h4>
            <p className="text-lg text-blue-600 font-medium mb-1">
              {candidate.jobTitle || 'No title'}
            </p>
            <p className="text-slate-600">{candidate.addressWithCountry || 'N/A'}</p>
          </div>
        </div>

        {candidate.matchScore !== undefined && (
          <div className="text-right">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getMatchScoreColor(
                candidate.matchScore
              )}`}
            >
              {candidate.matchScore}% Match
            </div>
            {candidate.salary && (
              <p className="text-lg font-bold text-slate-900 mt-2">{candidate.salary}</p>
            )}
          </div>
        )}
      </div>

      {candidate.summary && (
        <div className="mb-4">
          <p className="text-slate-700 leading-relaxed">{candidate.summary}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
        <div>
          <span className="font-medium text-slate-600">Experience:</span>
          <p className="text-slate-900">{formatExperience(candidate.experienceYears)}</p>
        </div>
        <div>
          <span className="font-medium text-slate-600">Availability:</span>
          <p className="text-slate-900">{candidate.availability || 'N/A'}</p>
        </div>
        <div>
          <span className="font-medium text-slate-600">Education:</span>
          <p className="text-slate-900">{candidate.education || 'N/A'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="font-medium text-slate-600 mb-2">Key Skills:</p>
        <div className="flex flex-wrap gap-2">
          {candidate.skills && candidate.skills.length > 0 ? (
            candidate.skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500 italic">No skills listed</span>
          )}
        </div>
      </div>

      <div className="flex space-x-3">
        <Link href={`/candidate/${candidate._id}`} passHref>
          <Button variant="outline" className="w-full flex-1 text-white">
            View Full Profile
          </Button>
        </Link>

        {candidate.linkedinUrl ? (
          <a
            href={candidate.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex-1"
          >
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              LinkedIn
            </Button>
          </a>
        ) : (
          <Button disabled className="flex-1">
            No LinkedIn
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CandidateCard;
