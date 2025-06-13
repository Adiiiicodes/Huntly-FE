'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { candidateService } from '@/services/candidateService';
import { allCandidatesService } from '@/services/allCandidateService';
import { Candidate } from '@/types/candidate';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CompareClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const query = searchParams.get('query') || '';
  const selectedIds = searchParams.getAll('id');

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!selectedIds || selectedIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const [searchResponse, allResponse] = await Promise.all([
          candidateService.searchCandidates(query),
          allCandidatesService.getAllCandidates(),
        ]);

        const searchCandidates: Candidate[] = searchResponse?.data || [];
        const allCandidates: Candidate[] = allResponse?.data || [];

        // Combine, remove duplicates by _id
        const merged = [
          ...searchCandidates,
          ...allCandidates.filter(
            (c) => !searchCandidates.some((s) => s._id === c._id)
          ),
        ];

        // Only include selected IDs
        const filtered = merged.filter((c) => selectedIds.includes(c._id));
        setCandidates(filtered);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }

      setLoading(false);
    };

    fetchCandidates();
  }, [selectedIds.join(','), query]);

  const formatExperience = (value: string | number) => {
    const exp = Number(value);
    return isNaN(exp)
      ? '-'
      : exp < 1
      ? `${Math.round(exp * 12)} months`
      : `${exp.toFixed(1)} years`;
  };

  return (
    <div className="min-h-screen bg-white py-10 px-4 md:px-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-black">Compare Candidates</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-md" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <p className="text-gray-500">No candidates selected for comparison.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-4 w-48 text-gray-600 font-medium">Feature</th>
                {candidates.map((candidate, idx) => (
                  <th
                    key={candidate._id}
                    className={`p-4 text-center text-black font-semibold ${
                      idx > 0 ? 'border-l border-gray-300' : ''
                    }`}
                  >
                    {candidate.fullName || 'Unnamed'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Role" values={candidates.map((c) => c.jobTitle || '-')} />
              <CompareRow label="Location" values={candidates.map((c) => c.addressWithCountry || '-')} />
              <CompareRow
                label="Experience"
                values={candidates.map((c) => formatExperience(c.experienceYears || 0))}
              />
              <CompareRow label="Availability" values={candidates.map((c) => c.availability || '-')} />
              <CompareRow label="Skills" values={candidates.map((c) => c.skills?.join(', ') || '-')} />
              <CompareRow label="Education" values={candidates.map((c) => c.education || '-')} />
              <CompareRow label="Email" values={candidates.map(() => 'N/A')} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const CompareRow = ({ label, values }: { label: string; values: (string | number)[] }) => (
  <tr className="border-t border-gray-200">
    <td className="p-4 font-medium text-gray-600 bg-gray-50">{label}</td>
    {values.map((val, idx) => (
      <td
        key={idx}
        className={`p-4 text-center text-gray-800 ${
          idx > 0 ? 'border-l border-gray-300' : ''
        }`}
      >
        {val}
      </td>
    ))}
  </tr>
);

export default CompareClient;
