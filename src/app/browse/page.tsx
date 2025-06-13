"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CandidateCard from "../../components/CandidateCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { allCandidatesService } from "@/services/allCandidateService";
import { Candidate } from "@/types/candidate";

const ITEMS_PER_PAGE = 6;

const Browse: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<Candidate[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const fetched = await allCandidatesService.getAllCandidates();
      setCandidates(fetched);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setSkillFilter("all");
    setAvailabilityFilter("all");
    setExperienceFilter("all");
    setCurrentPage(1);
  };

  const handleToggleSelect = (candidate: Candidate) => {
    setSelectedCandidates((prev) => {
      const exists = prev.find((c) => c._id === candidate._id);
      if (exists) {
        return prev.filter((c) => c._id !== candidate._id);
      } else {
        return [...prev, candidate];
      }
    });
  };

  const isCandidateSelected = (candidate: Candidate) =>
    selectedCandidates.some((c) => c._id === candidate._id);

  const filteredCandidates = candidates.filter((candidate) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      candidate.fullName?.toLowerCase().includes(searchLower) ||
      candidate.jobTitle?.toLowerCase().includes(searchLower) ||
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(searchLower)
      );

    const matchesLocation =
      locationFilter === "all" ||
      candidate.addressWithCountry?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesSkill =
      skillFilter === "all" ||
      candidate.skills?.some((skill) =>
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      );

    const matchesAvailability =
      availabilityFilter === "all" ||
      candidate.availability?.toLowerCase() === availabilityFilter.toLowerCase();

    const experienceYears = parseFloat((candidate.experienceYears ?? 0).toString());

    const matchesExperience =
      experienceFilter === "all" ||
      (experienceFilter === "junior" && experienceYears <= 3) ||
      (experienceFilter === "mid" && experienceYears > 3 && experienceYears <= 6) ||
      (experienceFilter === "senior" && experienceYears > 6);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesSkill &&
      matchesAvailability &&
      matchesExperience
    );
  });

  const totalPages = Math.ceil(filteredCandidates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentCandidates = filteredCandidates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">Browse All Candidates</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover talented professionals. Use our advanced filters to find your perfect match.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <Filter label="Location" value={locationFilter} onChange={(val) => { setLocationFilter(val); setCurrentPage(1); }} options={[
              { value: "all", label: "All Locations" },
              { value: "germany", label: "Germany" },
              { value: "mumbai", label: "Mumbai" },
              { value: "netherlands", label: "Netherlands" },
              { value: "uk", label: "United Kingdom" },
              { value: "ireland", label: "Ireland" },
              { value: "sweden", label: "Sweden" },
              { value: "france", label: "France" },
              { value: "italy", label: "Italy" },
            ]} />

            <Filter label="Skills" value={skillFilter} onChange={(val) => { setSkillFilter(val); setCurrentPage(1); }} options={[
              { value: "all", label: "All Skills" },
              { value: "python", label: "Python" },
              { value: "tensorflow", label: "TensorFlow" },
              { value: "pytorch", label: "PyTorch" },
              { value: "aws", label: "AWS" },
              { value: "kubernetes", label: "Kubernetes" },
              { value: "docker", label: "Docker" },
            ]} />

            <Filter label="Availability" value={availabilityFilter} onChange={(val) => { setAvailabilityFilter(val); setCurrentPage(1); }} options={[
              { value: "all", label: "All Types" },
              { value: "contract", label: "Contract" },
              { value: "full-time", label: "Full-time" },
              { value: "part-time", label: "Part-time" },
            ]} />

            <Filter label="Experience" value={experienceFilter} onChange={(val) => { setExperienceFilter(val); setCurrentPage(1); }} options={[
              { value: "all", label: "All Levels" },
              { value: "junior", label: "Junior (0-3 years)" },
              { value: "mid", label: "Mid (4-6 years)" },
              { value: "senior", label: "Senior (7+ years)" },
            ]} />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredCandidates.length} candidates — Page {currentPage} of {totalPages}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-gray-500 text-lg font-medium animate-pulse">
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI is analyzing candidates...
              </span>
            </div>
          ) : currentCandidates.length > 0 ? (
            currentCandidates.map((candidate) => (
              <CandidateCard
                key={candidate._id}
                candidate={candidate}
                isSelected={isCandidateSelected(candidate)}
                onToggleSelect={() => handleToggleSelect(candidate)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No candidates found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to find more candidates.
              </p>
              <Button onClick={clearFilters} className="bg-black text-white hover:bg-gray-800">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-4">
            <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        )}

        {/* Compare Button */}
        {selectedCandidates.length >= 2 && (
          <div className="flex justify-center mt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const query = selectedCandidates.map(c => `id=${c._id}`).join("&");
                window.location.href = `/compare?${query}`;
              }}
            >
              Compare Selected ({selectedCandidates.length})
            </Button>

          </div>
        )}

        {/* Compare Modal */}
        {showCompare && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-6xl overflow-auto max-h-[90vh] shadow-lg relative">
              <h2 className="text-2xl font-bold mb-4">Compare Candidates</h2>
              <Button className="absolute top-4 right-4" variant="outline" onClick={() => setShowCompare(false)}>
                Close
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedCandidates.map((candidate) => (
                  <div key={candidate._id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
                    <h3 className="text-xl font-semibold">{candidate.fullName}</h3>
                    <p className="text-sm text-gray-600">{candidate.jobTitle}</p>
                    <p className="mt-2 text-gray-800"><strong>Location:</strong> {candidate.addressWithCountry}</p>
                    <p className="text-gray-800"><strong>Experience:</strong> {candidate.experienceYears} years</p>
                    <p className="text-gray-800"><strong>Availability:</strong> {candidate.availability}</p>
                    <p className="text-gray-800"><strong>Skills:</strong> {candidate.skills?.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Browse;

// Reusable Filter Component
const Filter = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="flex-1 min-w-[200px]">
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={options[0]?.label || "Select"} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
