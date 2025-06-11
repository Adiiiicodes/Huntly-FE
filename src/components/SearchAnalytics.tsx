'use client';

import React from 'react';
import { Candidate } from '@/types/candidate';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Users, MapPin, Clock, X } from 'lucide-react'; // ADDED X IMPORT

interface SearchAnalyticsProps {
  candidates: Candidate[];
  onClose?: () => void; // ADDED PROPS
}

const pieColors = ['#000000', '#404040', '#666666', '#808080', '#a0a0a0', '#c0c0c0'];

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ candidates, onClose }) => {
  if (candidates.length === 0) return null;

  const chartConfig = {
    count: {
      label: 'Count',
      color: '#000000',
    },
  };

  // === Dynamic Skill Analysis ===
  const skillsCount: Record<string, number> = {};
  candidates.forEach((candidate) => {
    candidate?.skills?.forEach((skill: string) => {
      const normalized = skill?.toLowerCase().trim();
      if (normalized) {
        skillsCount[normalized] = (skillsCount[normalized] || 0) + 1;
      }
    });
  });
  const skillsData = Object.entries(skillsCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([skill, count]) => ({ skill, count }));

  // === Dynamic Experience Buckets ===
  const experienceData: Record<string, number> = {};
  candidates.forEach((c) => {
    const years = parseInt(c?.experience || '0', 10);
    const bucket =
      years < 3
        ? 'Entry (0-2)'
        : years < 6
        ? 'Mid (3-5)'
        : years < 9
        ? 'Senior (6-8)'
        : 'Expert (8+)';
    experienceData[bucket] = (experienceData[bucket] || 0) + 1;
  });
  const experienceChartData = Object.entries(experienceData).map(([level, count]) => ({
    level,
    count,
  }));

  // === Availability Types ===
  const availabilityData: Record<string, number> = {};
  candidates.forEach((c) => {
    const type = c?.availability || 'Unknown';
    availabilityData[type] = (availabilityData[type] || 0) + 1;
  });
  const availabilityChartData = Object.entries(availabilityData).map(([type, count]) => ({
    type,
    count,
  }));

  // === Location Distribution ===
  const locationData: Record<string, number> = {};
  candidates.forEach((c) => {
    const city = c?.location?.split(',')[0]?.trim() || 'Unknown';
    locationData[city] = (locationData[city] || 0) + 1;
  });
  const locationChartData = Object.entries(locationData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([city, count]) => ({ city, count }));

  const avgMatchScore = Math.round(
    candidates.reduce((acc, c) => acc + (c?.matchScore || 0), 0) / candidates.length
  );

  return (
    <div className="mb-8">
      {/* MODIFIED HEADER WITH CLOSE BUTTON */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <h3 className="text-xl font-bold text-slate-900">Search Analytics</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <Card className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Top Skills</h4>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={skillsData}>
              <XAxis dataKey="skill" fontSize={12} angle={-45} textAnchor="end" height={60} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#000000" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Experience */}
        <Card className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Experience Levels</h4>
          <ChartContainer config={chartConfig} className="h-64">
            <PieChart>
              <Pie
                data={experienceChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="count"
                label={({ level, count }) => `${level}: ${count}`}
                labelLine={false}
              >
                {experienceChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Availability */}
        <Card className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Availability</h4>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={availabilityChartData}>
              <XAxis dataKey="type" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#000000" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Locations */}
        <Card className="p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Top Locations</h4>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={locationChartData}>
              <XAxis dataKey="city" fontSize={12} />
              <YAxis fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#000000" radius={4} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-black text-white p-4 rounded-lg text-center">
          <div className="text-2xl font-bold">{candidates.length}</div>
          <div className="text-sm text-gray-300">Total Candidates</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-black">{avgMatchScore}%</div>
          <div className="text-sm text-gray-600">Avg Match Score</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-black">{Object.keys(skillsCount).length}</div>
          <div className="text-sm text-gray-600">Unique Skills</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-black">{Object.keys(locationData).length}</div>
          <div className="text-sm text-gray-600">Cities</div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;