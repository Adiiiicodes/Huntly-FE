'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { allCandidatesService } from '@/services/allCandidateService';
import { Candidates } from '@/types/candidate';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const CompareClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidates[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get('ids') || searchParams.getAll('id').join(',');

  useEffect(() => {
    const fetchAndFilterCandidates = async () => {
      if (!idsParam) {
        console.warn('No ids provided in URL');
        setLoading(false);
        return;
      }

      try {
        const allCandidates = await allCandidatesService.getAllCandidates();
        const selectedIds = idsParam.split(',').map(id => id.trim());
        const filtered = allCandidates.filter(c => selectedIds.includes(c._id));
        setCandidates(filtered);
      } catch (error) {
        console.error('Error filtering candidates:', error);
      }
      setLoading(false);
    };

    fetchAndFilterCandidates();
  }, [idsParam]);

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
              <CompareRow label="Email" values={candidates.map((c) => c.email || '-')} />
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
        className={`p-4 text-center text-gray-800 ${idx > 0 ? 'border-l border-gray-300' : ''}`}
      >
        {val}
      </td>
    ))}
  </tr>
);

export default CompareClient;
