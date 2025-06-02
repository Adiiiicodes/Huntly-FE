'use client';

import { BarChart, Card, Title } from '@tremor/react';
import { Candidate, LocationData, SkillData } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';

export function TalentPoolStats({ candidates }: { candidates: Candidate[] }) {
  const locationData = useMemo(() => getLocationData(candidates), [candidates]);
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

function getSkillsData(candidates: Candidate[]): SkillData[] {
  const skillsMap = candidates.flatMap(c => c.skills).reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(skillsMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
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

// Updated LocationChart component with client-side rendering logic
function LocationChart({ data }: { data: LocationData[] }) {
  // State to manage client-side rendering
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Define colors with hex codes
  const chartColors = [
    "#0ea5e9", // sky-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#f43f5e", // rose-500
    "#f59e0b", // amber-500
    "#10b981"  // emerald-500
  ];

  // Calculate total
  const total = topLocations.reduce((sum, item) => sum + item.value, 0);

  // Define type for segments (moved inside the component)
  interface Segment {
    path: string;
    color: string;
  }

  // Create a simple custom pie chart calculation - only on client side
  const pieSegments = useMemo(() => {
    if (!isClient) return []; // Return empty array during server rendering
    
    let startAngle = 0;
    const segments: Segment[] = [];
    
    topLocations.forEach((item, index) => {
      // Calculate angle for this segment
      const percentage = item.value / total;
      const angle = percentage * 360;
      const endAngle = startAngle + angle;
      
      // Round to fewer decimal places to ensure consistent values
      const round = (num: number) => Number(num.toFixed(4));
      
      // Create SVG arc path with rounded values
      const x1 = round(50 + 40 * Math.cos((startAngle * Math.PI) / 180));
      const y1 = round(50 + 40 * Math.sin((startAngle * Math.PI) / 180));
      const x2 = round(50 + 40 * Math.cos((endAngle * Math.PI) / 180));
      const y2 = round(50 + 40 * Math.sin((endAngle * Math.PI) / 180));
      
      // Determine if angle is greater than 180 degrees
      const largeArcFlag = angle > 180 ? 1 : 0;
      
      // Create the SVG path
      const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      segments.push({
        path,
        color: chartColors[index % chartColors.length]
      });
      
      // Update start angle for next segment
      startAngle = endAngle;
    });
    
    return segments;
  }, [topLocations, total, chartColors, isClient]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <Title className="text-white">Location Distribution</Title>
      <div className="mt-4 h-52 flex justify-center">
        {!isClient ? (
          // Show a simple loading state during server rendering
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading chart...
          </div>
        ) : topLocations.length > 0 ? (
          <div className="relative w-[200px] h-[200px]">
            {/* Custom SVG pie chart - only rendered on client */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {pieSegments.map((segment, index) => (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  stroke="#1f2937"
                  strokeWidth="0.5"
                />
              ))}
              {/* Center circle */}
              <circle cx="50" cy="50" r="15" fill="#1f2937" />
            </svg>
            
            {/* Text in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{total}</span>
              <span className="text-xs text-gray-300">candidates</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No location data available
          </div>
        )}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {topLocations.map((item, index) => (
          <div key={index} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: chartColors[index % chartColors.length] }}
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
        valueFormatter={(value: number) => `${value} candidates`}
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
          valueFormatter={(value: number) => `${value} candidates`}
        />
      </div>
    </Card>
  );
}