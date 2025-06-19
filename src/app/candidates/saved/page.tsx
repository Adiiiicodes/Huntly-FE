'use client';

import { useEffect, useState } from 'react';
import { getSavedProfiles, formatProfileForDisplay } from '@/services/savedProfiles';
import CandidateCard from '@/components/CandidateCard';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type Candidate = {
  id: string;
  name: string;
  position: string;
  location: string;
  experience: string;
};

const SavedCandidatesPage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
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
              avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.name || '')}&background=random`,
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
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white py-8 px-6 fixed left-0 top-0 z-20 shadow-xl">
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
              {user?.name ? user.name[0].toUpperCase() : '?'}
            </div>
            <div>
              <div className="font-semibold text-lg">{user?.name || 'User'}</div>
              <div className="text-gray-400 text-xs">{user?.email || ''}</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          <button
            className="text-left px-4 py-2 rounded hover:bg-gray-800 transition font-medium"
            onClick={() => router.push('/')}
          >
            Home
          </button>
          <button
            className="text-left px-4 py-2 rounded hover:bg-gray-800 transition font-medium"
            onClick={() => router.push('/browse')}
          >
            Browse All
          </button>
          <button
            className="text-left px-4 py-2 rounded hover:bg-gray-800 transition font-medium mt-auto text-red-400 hover:text-red-300"
            onClick={() => { logout(); router.push('/login'); }}
          >
            Logout
          </button>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="min-h-screen bg-white py-8">
          <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-10">
            <div className="flex flex-col items-center mb-6">
              <h1 className="text-3xl font-extrabold text-black text-center tracking-tight pb-1 w-fit mx-auto drop-shadow-sm">
                Saved candidates for you{user && user.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-gray-600 text-lg mt-1 mb-2 text-center">All your favorite profiles in one place</p>
            </div>
            <div className="mb-4 border-b border-gray-200"></div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-black border-solid"></div>
                <span className="ml-4 text-base text-black font-semibold">Loading...</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-12 text-lg text-gray-500 font-medium">No saved candidates found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {candidates.map(candidate => (
                  <div key={candidate._id} className="w-full">
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
        </div>
      </div>
    </div>
  );
};

export default SavedCandidatesPage; 