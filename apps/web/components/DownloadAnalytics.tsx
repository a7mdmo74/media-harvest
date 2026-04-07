'use client';

import { useState, useEffect } from 'react';
import { Download, TrendingUp, Monitor, Github, Globe, Users, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DownloadMetrics {
  totalDownloads: number;
  windowsDownloads: number;
  macDownloads: number;
  linuxDownloads: number;
  githubDownloads: number;
  websiteDownloads: number;
}

interface DownloadData {
  period: string;
  totals: DownloadMetrics;
  dailyData: Array<{
    date: string;
    totalDownloads: number;
    windowsDownloads: number;
    macDownloads: number;
    linuxDownloads: number;
    githubDownloads: number;
    websiteDownloads: number;
  }>;
}

export default function DownloadAnalytics() {
  const [data, setData] = useState<DownloadData | null>(null);
  const [loading, setLoading] = useState(true);


  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/downloads?period=year`);
      if (response.ok) {
        const metrics = await response.json();
        setData(metrics);
      }
    } catch (error) {
      console.error('Failed to fetch download metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPercentage = (part: number, total: number): string => {
    if (total === 0) return '0';
    return `${Math.round((part / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 border border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 animate-pulse"></div>
            <div className="relative">
              <div className="h-4 bg-zinc-700 rounded w-3/4 mb-3"></div>
              <div className="h-8 bg-zinc-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-400">No download data available</p>
      </div>
    );
  }

  const { totals } = data;

  return (
    <div className="space-y-8">


      {/* Hero Stats Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 border border-blue-500/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="relative text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">Total Downloads</h3>
          <p className="text-5xl font-black text-white mb-2">{formatNumber(totals.totalDownloads)}</p>
          <p className="text-blue-100">Users worldwide trust Media Harvest</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 p-6 border border-green-600/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-600/20 rounded-xl">
                <Monitor className="h-6 w-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-green-400">{formatNumber(totals.windowsDownloads)}</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">Windows</h4>
            <p className="text-sm text-zinc-400 mb-3">Windows 10/11 users</p>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: getPercentage(totals.windowsDownloads, totals.totalDownloads) }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">{getPercentage(totals.windowsDownloads, totals.totalDownloads)} of total</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-6 border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <Monitor className="h-6 w-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-400">{formatNumber(totals.macDownloads)}</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">macOS</h4>
            <p className="text-sm text-zinc-400 mb-3">macOS users</p>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: getPercentage(totals.macDownloads, totals.totalDownloads) }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">{getPercentage(totals.macDownloads, totals.totalDownloads)} of total</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-red-600/20 p-6 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-600/20 rounded-xl">
                <Monitor className="h-6 w-6 text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-orange-400">{formatNumber(totals.linuxDownloads)}</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-1">Linux</h4>
            <p className="text-sm text-zinc-400 mb-3">Linux users</p>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: getPercentage(totals.linuxDownloads, totals.totalDownloads) }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">{getPercentage(totals.linuxDownloads, totals.totalDownloads)} of total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
