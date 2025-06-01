'use client';

import { BarChart, Card, DonutChart, Title, BarList } from '@tremor/react';
import { Candidate, LocationData, SkillData, ExperienceData } from '@/lib/types';
import { useMemo } from 'react';

export function TalentPoolStats({ candidates }: { candidates: Candidate[] }) {
  const locationData = useMemo(() => getLocationData(candidates), [candidates]);
  const experienceData = useMemo(() => getExperienceData(candidates), [candidates]);
  const skillsData = useMemo(() => getSkillsData(candidates), [candidates]);

  // Group experience into ranges
  const experienceRanges = useMemo(() => {
    const ranges: Record<string, number> = {
      '0-2 years': 0,
      '3-5 years': 0,
      '6-8 years': 0,
      '9-12 years': 0,
      '13+ years': 0,
    };
    
    candidates.forEach(candidate => {
      const exp = candidate.experience_years;
      if (exp <= 2) ranges['0-2 years']++;
      else if (exp <= 5) ranges['3-5 years']++;
      else if (exp <= 8) ranges['6-8 years']++;
      else if (exp <= 12) ranges['9-12 years']++;
      else ranges['13+ years']++;
    });
    
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 bg-gray-900 p-6 rounded-xl shadow-2xl">
      <SummaryCard count={candidates.length} />
      <LocationChart data={locationData} />
      <ExperienceChart data={experienceRanges} />
      <SkillsChart data={skillsData} />
    </div>
  );
}

function SummaryCard({ count }: { count: number }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <Title className="text-white">Total Candidates</Title>
      <p className="text-4xl font-bold text-cyan-400">{count}</p>
      <div className="mt-4 text-sm text-gray-300">
        Candidates matching your search criteria
      </div>
    </Card>
  );
}

function LocationChart({ data }: { data: LocationData[] }) {
  // Limit to top 5 locations + group others
  const topLocations = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
    
    if (others > 0) {
      return [...top5, { name: 'Other', value: others }];
    }
    return top5;
  }, [data]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <Title className="text-white">Location Distribution</Title>
      <div className="mt-4 h-52">
        <DonutChart
          data={topLocations}
          category="value"
          index="name"
          colors={['cyan', 'indigo', 'violet', 'fuchsia', 'rose', 'amber']}
          variant="pie"
          showAnimation
          valueFormatter={(value) => `${value}`}
          label={`${topLocations.reduce((sum, item) => sum + item.value, 0)} candidates`}
          className="h-full"
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {topLocations.map((item, index) => (
          <div key={index} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ 
                backgroundColor: [
                  '#06b6d4', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b'
                ][index % 6] 
              }}
            ></div>
            <span className="text-gray-300 truncate">{item.name}</span>
            <span className="text-white font-medium ml-auto">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ExperienceChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <Title>Experience Breakdown</Title>
      <p className="text-sm text-gray-300 mt-1">
        Distribution of candidates across different experience levels
      </p>
      <BarChart
        data={data}
        index="name"
        categories={['value']}
        colors={['cyan']}
        className="mt-6 h-56"
        layout="vertical"
        showAnimation
        showLegend={false}
        yAxisWidth={70}
        valueFormatter={(value) => `${value} candidates`}
      />
    </Card>
  );
}

function SkillsChart({ data }: { data: SkillData[] }) {
  const topSkills = useMemo(() =>
    data
      .slice(0, 10)
      .map(skill => ({
        name: skill.name.length > 20 ? skill.name.slice(0, 20) + '…' : skill.name,
        count: skill.value,
      })),
    [data]
  );

  return (
    <Card className="md:col-span-2 lg:col-span-3 bg-gray-800 border-gray-700 text-white">
      <Title>Top In-Demand Skills</Title>
      <p className="text-sm text-gray-300 mt-1">
        Most frequently listed skills among candidates
      </p>
      <div className="mt-6 h-80 text-white">
        <BarChart
          data={topSkills}
          index="name"
          categories={['count']}
          colors={['cyan']}
          layout="vertical"
          yAxisWidth={90}
          showAnimation
          showLegend={false}
          valueFormatter={(value) => `${value} candidates`}
        />
      </div>
    </Card>
  );
}


// Data transformation functions
function getLocationData(candidates: Candidate[]): LocationData[] {
  const locationMap = candidates.reduce((acc, candidate) => {
    acc[candidate.location] = (acc[candidate.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(locationMap).map(([name, value]) => ({
    name,
    value,
  }));
}

function getExperienceData(candidates: Candidate[]): ExperienceData[] {
  return candidates.map(candidate => ({
    name: candidate.name,
    'Experience (years)': candidate.experience_years,
  }));
}

function getSkillsData(candidates: Candidate[]): SkillData[] {
  const skillsMap = candidates.flatMap(c => c.skills).reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(skillsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}