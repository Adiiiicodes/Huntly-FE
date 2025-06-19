'use client';

import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Briefcase, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getSavedProfiles, formatProfileForDisplay, saveProfile, removeProfile } from '@/services/savedProfiles';
import BookmarkIcon from '@/components/BookmarkIcon';

interface SavedCandidate {
  id: string;
  name: string;
  position: string;
  lastActivity?: string;
}

const UserProfile = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // For debugging
  useEffect(() => {
    console.log("UserProfile mounted, user:", user);
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch saved profiles from API
  useEffect(() => {
    if (user && isOpen) { // Fetch only when dropdown is opened and user is logged in
      const fetchSavedProfiles = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const userId = user.id;
          console.log(`Fetching saved profiles for user ID: ${userId}`);
          
          // Use the service to fetch saved profiles
          const profiles = await getSavedProfiles(userId);
          
          // Format the profiles for display
          const formattedCandidates = profiles.map(formatProfileForDisplay);
          setSavedCandidates(formattedCandidates);
          
        } catch (err) {
          console.error('Error fetching saved profiles:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch saved profiles');
          setSavedCandidates([]); // Reset to empty array on error
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSavedProfiles();
    }
  }, [user, isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  // If user is undefined, show a placeholder button to help with debugging
  if (!user) {
    return (
      <Button 
        variant="outline" 
        className="border-2 border-red-500 text-red-500 font-bold"
        onClick={() => console.log("Auth state check: user not authenticated")}
      >
        Not Logged In
      </Button>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleSaveClick = async (candidateId: string) => {
    if (!savedCandidates.some(c => c.id === candidateId)) {
      await saveProfile(candidateId);
      setSavedCandidates(prev => [...prev, { id: candidateId, name: '', position: '' }]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef} style={{ border: '2px solid transparent', padding: '2px', borderRadius: '8px' }}>
      <Button
        variant="default"
        className="flex items-center gap-2 px-3 py-2 rounded-md bg-black hover:bg-gray-800 text-white"
        style={{ minWidth: '120px', justifyContent: 'space-between' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-black text-white text-xs font-bold">
              {user.name ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name?.split(' ')[0] || 'User'}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-black" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-700 font-medium">{user.name}</p>
            <p className="text-xs text-gray-600">{user.email}</p>
          </div>

          <div className="py-2">
            <Link 
              href="/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-4 w-4 text-gray-500" />
              My Profile
            </Link>
            
            <Link 
              href="/settings" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4 text-gray-500" />
              Account Settings
            </Link>
          </div>

          <div className="py-2 border-t border-b border-gray-100">
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Saved Candidates</p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading profiles...</span>
              </div>
            ) : error ? (
              <div className="px-4 py-2 text-sm text-red-500">
                Error: {error}
              </div>
            ) : savedCandidates.length > 0 ? (
              <div className="max-h-48 overflow-y-auto">
                {savedCandidates.map(candidate => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <Briefcase className="mr-3 h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 truncate">{candidate.position}</p>
                        {candidate.lastActivity && (
                          <p className="text-xs text-gray-600 ml-1">{candidate.lastActivity}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No saved candidates yet
              </div>
            )}
            
            <Link
              href="/candidates/saved"
              className="flex items-center justify-center px-4 py-2 text-xs text-primary hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              View all saved candidates
            </Link>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

