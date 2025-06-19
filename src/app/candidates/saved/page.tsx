'use client';

import { useEffect, useState } from 'react';
import { getSavedProfiles, formatProfileForDisplay } from '@/services/savedProfiles';
import CandidateCard from '@/components/CandidateCard';
import { useAuth } from '@/contexts/AuthContext';

type Candidate = {
  id: string;
  name: string;
  position: string;
  location: string;
  experience: string;
};

const SavedCandidatesPage = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedCandidateIds, setSavedCandidateIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getSavedProfiles(user.id)
        .then(profiles => {
          console.log(profiles);
          setCandidates(
            profiles.map(profile => ({
              ...profile,
              skills: Array.isArray(profile.skills)
                ? profile.skills
                : (typeof profile.skills === 'string' && profile.skills.length > 0
                    ? profile.skills.split(',').map(s => s.trim())
                    : [])
            }))
          );
          setSavedCandidateIds(profiles.map(profile => profile._id));
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please log in to view saved candidates.</div>;

  return (
    <div className="container bg-white mx-auto py-8">
      <div className="flex justify-center mb-10">
        <h1 className="text-3xl font-bold text-black text-center border-b-4 pb-2 w-fit mx-auto drop-shadow-sm">
          <span className="bg-black bg-clip-text text-transparent">
            Saved candidates for you{user && user.name ? `, ${user.name}` : ''}
          </span>
        </h1>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : candidates.length === 0 ? (
        <div>No saved candidates found.</div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          {candidates.map(candidate => (
            <div key={candidate._id} className="w-full max-w-4xl">
              <CandidateCard
                candidate={candidate}
                isSaved={true}
                isSelected={false}
                onToggleSelect={() => {}}
                hideSaveIcon
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCandidatesPage; 