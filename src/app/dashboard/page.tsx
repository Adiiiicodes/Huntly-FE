'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Users, TrendingUp, Clock, Star } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '../../components/Header';
import { allCandidatesService } from '@/services/allCandidateService';
import { Candidate } from '@/types/candidate';

const Dashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      try {
        const data = await allCandidatesService.getAllCandidates();
        setCandidates(data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const skillsData = useMemo(() => {
    const skillCount: Record<string, number> = {};
    candidates.forEach(candidate => {
      candidate.skills?.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    return Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, candidates]) => ({ name, candidates }));
  }, [candidates]);

  const locationData = useMemo(() => {
    const locationCount: Record<string, number> = {};
    const regionMap = {
      'Europe': ['Europe', 'Germany', 'UK', 'Netherlands'],
      'North America': ['US', 'America'],
      'Asia': ['Asia'],
    };

    candidates.forEach(candidate => {
      const loc = candidate.location || '';
      let region = 'Other';
      for (const [key, values] of Object.entries(regionMap)) {
        if (values.some(v => loc.includes(v))) {
          region = key;
          break;
        }
      }
      locationCount[region] = (locationCount[region] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    return Object.entries(locationCount).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [candidates]);

  const avgMatchScore = useMemo(() => {
    if (!candidates.length) return 0;
    const totalScore = candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0);
    return Math.round(totalScore / candidates.length);
  }, [candidates]);

  const hiringTrends = [
    { month: 'Jan', hires: 12 },
    { month: 'Feb', hires: 15 },
    { month: 'Mar', hires: 18 },
    { month: 'Apr', hires: 22 },
    { month: 'May', hires: 25 },
    { month: 'Jun', hires: 28 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Talent Dashboard</h1>
            <p className="text-slate-600">Monitor your talent pool and hiring analytics</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">Total Candidates</p><p className="text-3xl font-bold text-slate-900">{candidates.length}</p></div><Users className="w-8 h-8 text-blue-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">Active Searches</p><p className="text-3xl font-bold text-slate-900">89</p></div><TrendingUp className="w-8 h-8 text-green-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">Avg. Match Score</p><p className="text-3xl font-bold text-slate-900">{avgMatchScore}%</p></div><Star className="w-8 h-8 text-yellow-600" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">Avg. Response Time</p><p className="text-3xl font-bold text-slate-900">2.3h</p></div><Clock className="w-8 h-8 text-purple-600" /></div></CardContent></Card>
          </div>

          {/* Tabs and Charts */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger className='text-black' value="overview">Overview</TabsTrigger>
              <TabsTrigger className='text-black' value="skills">Skills Analysis</TabsTrigger>
              <TabsTrigger className='text-black' value="trends">Hiring Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Candidate Distribution by Location</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={locationData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Monthly Hiring Trends</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hiringTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hires" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <CardHeader><CardTitle>Top Skills in Talent Pool</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={skillsData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="candidates" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader><CardTitle>Hiring Performance Over Time</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={hiringTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hires" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;