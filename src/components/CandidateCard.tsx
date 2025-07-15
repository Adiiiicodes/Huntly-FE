// CandidateCard.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { Candidate } from '../types/candidate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onToggleSelect: (candidateId: string, e: React.MouseEvent) => void; // Added event parameter
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

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onToggleSelect(
      typeof candidate._id === 'string' ? candidate._id : candidate._id.$oid,
      e
    );
  };

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add a subtle scale animation
    const button = e.currentTarget;
    button.classList.add('scale-110');
    setTimeout(() => button.classList.remove('scale-110'), 200);
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token'); // or 'session_token'
      const res = await fetch(`/api/profiles/save/${candidate._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch (err) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      className={`p-6 hover:shadow-lg transition-all duration-300 border-l-4 relative ${
        isSelected ? 'border-l-green-600 bg-green-50' : 'border-l-blue-500'
      }`}
    >
      {/* Instagram-style Save Button */}
      <button
        onClick={handleSaveProfile}
        disabled={saving}
        className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 ${
          saving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label={saved ? 'Saved' : 'Save profile'}
      >
        {saved ? (
          <BookmarkCheck 
            className="w-6 h-6 text-gray-900 fill-current transition-transform duration-200" 
          />
        ) : (
          <Bookmark 
            className="w-6 h-6 text-gray-700 hover:text-gray-900 transition-colors duration-200" 
          />
        )}
      </button>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // Empty onChange to satisfy React
            onClick={handleCheckboxClick}
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
          <div className="pr-12"> {/* Add padding to prevent overlap with save button */}
            <h4 className="text-xl font-bold text-slate-900 mb-1">
              {candidate.fullName}
            </h4>
            <p className="text-lg text-blue-600 font-medium mb-1">
              {candidate.jobTitle}
            </p>
            <p className="text-slate-600">{candidate.addressWithCountry || 'N/A'}</p>
          </div>
        </div>

        {candidate.matchScore !== undefined && (
          <div className="text-right mr-12"> {/* Add margin to prevent overlap */}
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
          {Array.isArray(candidate.education) ? (
            candidate.education.length > 0 ? (
              <ul className="text-slate-900 list-disc ml-4">
                {candidate.education.map((edu, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{edu.school}</span>
                    {edu.degree && `, ${edu.degree}`}
                    {edu.description && ` - ${edu.description}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No education listed</p>
            )
          ) : typeof candidate.education === 'object' && candidate.education !== null ? (
            <p className="text-slate-900">
              <span className="font-semibold">{candidate.education.school}</span>
              {candidate.education.degree && `, ${candidate.education.degree}`}
              {candidate.education.description && ` - ${candidate.education.description}`}
            </p>
          ) : (
            <p className="text-slate-900">
              {typeof candidate.education === 'string'
                ? candidate.education
                : candidate.education
                ? `${candidate.education.school}${candidate.education.degree ? `, ${candidate.education.degree}` : ''}${candidate.education.description ? ` - ${candidate.education.description}` : ''}`
                : 'N/A'}
            </p>
          )}
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
                {typeof skill === 'string' ? skill : skill.title}
              </Badge>
            ))
          ) : (
            <span className="text-slate-500 italic">No skills listed</span>
          )}
        </div>
      </div>

      <div className="flex space-x-3 mt-4">
        <Button variant="outline" className="w-full flex-1 text-white" asChild>
          <Link href={`/candidate/${candidate._id}`}>
            View Full Profile
          </Link>
        </Button>

        {candidate.linkedinUrl ? (
          <Button asChild className="w-full flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </Button>
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