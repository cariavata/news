import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { useAppStore } from '../store/useArticleStore';
import { format, subDays, subMonths, startOfDay } from 'date-fns';
import { RotateCcw, TrendingUp, Users, Smartphone, Globe } from 'lucide-react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const { analytics, resetAnalytics } = useAppStore();

  const handleReset = () => {
    if (window.confirm('모든 방문자 통계 및 검색어 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetAnalytics();
      alert('초기화 되었습니다.');
    }
  };

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Calculate summary metrics
  const getSumOfDays = (days: number) => {
    const today = startOfDay(new Date());
    let total = 0;
    for (let i = 0; i < days; i++) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      total += analytics.dailyViews?.[dateStr] || 0;
    }
    return total;
  };

  const todayViews = analytics.dailyViews?.[todayStr] || 0;
  const weekViews = getSumOfDays(7);
  const monthViews = getSumOfDays(30);
  const yearViews = getSumOfDays(365);

  const getDaysForRange = () => {
    if (timeRange === 'day') return 1;
    if (timeRange === 'week') return 7;
    if (timeRange === 'month') return 30;
    return 365; // year
  };

  const generateChartData = () => {
    const today = startOfDay(new Date());

    if (timeRange === 'day' || timeRange === 'week') {
      // Last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const displayStr = format(d, 'MM/dd');
        data.push({
          name: displayStr,
          visitors: analytics.dailyViews?.[dateStr] || 0
        });
      }
      return data;
    }

    if (timeRange === 'month') {
      // Last 30 days
      const data = [];
      for (let i = 29; i >= 0; i--) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const displayStr = format(d, 'MM/dd');
        data.push({
          name: displayStr,
          visitors: analytics.dailyViews?.[dateStr] || 0
        });
      }
      return data;
    }

    if (timeRange === 'year') {
      // Last 12 months aggregated
      const data = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const m = subMonths(now, i);
        const monthPrefix = format(m, 'yyyy-MM');
        const monthLabel = format(m, 'yy년 M월');

        // Sum all dailyViews matching monthPrefix
        let monthTotal = 0;
        if (analytics.dailyViews) {
          for (const [dateKey, count] of Object.entries(analytics.dailyViews)) {
            if (dateKey.startsWith(monthPrefix)) {
              monthTotal += count;
            }
          }
        }

        data.push({
          name: monthLabel,
          visitors: monthTotal
        });
      }
      return data;
    }

    return [];
  };

  // Aggregate stats based on timeRange
  const aggregateStats = () => {
    let days = getDaysForRange();
    const today = startOfDay(new Date());
    
    const aggregatedKeywords: Record<string, number> = {};
    const aggregatedDevices: Record<string, number> = {};
    const aggregatedReferrers: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
        const d = subDays(today, i);
        const dateStr = format(d, 'yyyy-MM-dd');
        
        const dayKeywords = analytics.dailyKeywords?.[dateStr] || {};
        for (const [kw, count] of Object.entries(dayKeywords)) {
            aggregatedKeywords[kw] = (aggregatedKeywords[kw] || 0) + count;
        }

        const dayDevices = analytics.dailyDevices?.[dateStr] || {};
        for (const [dev, count] of Object.entries(dayDevices)) {
            aggregatedDevices[dev] = (aggregatedDevices[dev] || 0) + count;
        }

        const dayReferrers = analytics.dailyReferrers?.[dateStr] || {};
        for (const [ref, count] of Object.entries(dayReferrers)) {
            aggregatedReferrers[ref] = (aggregatedReferrers[ref] || 0) + count;
        }
    }

    // Fallback to total keywords if aggregated is empty
    if (Object.keys(aggregatedKeywords).length === 0 && analytics.keywords) {
      Object.assign(aggregatedKeywords, analytics.keywords);
    }
    if (Object.keys(aggregatedDevices).length === 0 && analytics.devices) {
      Object.assign(aggregatedDevices, analytics.devices);
    }

    return { aggregatedKeywords, aggregatedDevices, aggregatedReferrers };
  };

  const { aggregatedKeywords, aggregatedDevices, aggregatedReferrers } = aggregateStats();

  const keywords = Object.entries(aggregatedKeywords)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const referrers = Object.entries(aggregatedReferrers)
    .map(([url, count]) => ({ url, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const deviceData = Object.entries(aggregatedDevices).map(([name, val]) => ({
    name: name === 'Mo' ? '모바일 (Mobile)' : name === 'PC' ? '데스크톱 (PC)' : '태블릿 (Tablet)',
    val
  })).sort((a, b) => b.val - a.val);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      
      {/* Top Header & Range Selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-900" />
            방문자 통계 분석
          </h1>
          <p className="text-sm text-slate-500 mt-1">사이트의 일간·주간·월간·년간 트래픽 흐름과 유입 데이터를 분석합니다.</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            {(['day', 'week', 'month', 'year'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-md transition ${timeRange === range ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                {range === 'day' ? '오늘' : range === 'week' ? '주간 (7일)' : range === 'month' ? '월간 (30일)' : '년간 (12개월)'}
              </button>
            ))}
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition text-xs sm:text-sm font-bold border border-red-200"
          >
            <RotateCcw className="w-4 h-4" /> 초기화
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>오늘 카운트</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{todayViews.toLocaleString()}</span>
            <span className="text-slate-400 text-xs ml-1 font-medium">회</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-2 font-medium">실시간 집계 중</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>최근 7일 (주간)</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{weekViews.toLocaleString()}</span>
            <span className="text-slate-400 text-xs ml-1 font-medium">회</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">일평균 약 {Math.round(weekViews / 7)}회</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>최근 30일 (월간)</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{monthViews.toLocaleString()}</span>
            <span className="text-slate-400 text-xs ml-1 font-medium">회</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">일평균 약 {Math.round(monthViews / 30)}회</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>최근 12개월 (년간)</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{yearViews.toLocaleString()}</span>
            <span className="text-slate-400 text-xs ml-1 font-medium">회</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">월평균 약 {Math.round(yearViews / 12).toLocaleString()}회</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {timeRange === 'day' ? '최근 7일간 일별 방문 트렌드' :
               timeRange === 'week' ? '주간(최근 7일) 방문 트렌드' :
               timeRange === 'month' ? '월간(최근 30일) 방문 트렌드' :
               '년간(최근 12개월) 월별 누적 트렌드'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">그래프 각 지점에 마우스를 올리면 정확한 숫자 카운트를 확인할 수 있습니다.</p>
          </div>
        </div>

        <div className="p-6 h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                formatter={(val: any) => [`${Number(val).toLocaleString()}회`, '방문 카운트']}
              />
              <Area type="monotone" dataKey="visitors" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Search Keywords */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-base font-bold font-sans text-slate-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            주요 유입 검색어
          </h2>
          {keywords.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium pb-8 text-sm text-center">
              수집된 검색어 데이터가 없습니다.
            </div>
          ) : (
            <ul className="space-y-3.5 flex-1">
              {keywords.map((kw, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-slate-400 font-serif font-bold italic text-base w-5 shrink-0">{i + 1}</span>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate text-sm">{kw.keyword}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 shrink-0 rounded text-xs font-mono font-bold">
                    {kw.count.toLocaleString()}건
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-base font-bold font-sans text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-600" />
            유입 경로 (Referrer)
          </h2>
          {referrers.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium pb-8 text-sm text-center">
              수집된 유입 경로 데이터가 없습니다.
            </div>
          ) : (
            <ul className="space-y-3.5 flex-1 overflow-hidden">
              {referrers.map((ref, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <span className="text-slate-400 font-serif font-bold italic text-base w-5 shrink-0">{i + 1}</span>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate text-sm" title={ref.url}>{ref.url || '직접 유입'}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 shrink-0 rounded text-xs font-mono font-bold">
                    {ref.count.toLocaleString()}건
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Device Types */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-[380px] flex flex-col">
          <h2 className="text-base font-bold font-sans text-slate-800 mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-600" />
            디바이스 환경 분류
          </h2>
          <div className="flex-1 w-full h-full">
            {deviceData.length === 0 ? (
               <div className="flex-1 flex h-full items-center justify-center text-slate-400 font-medium pb-8 text-sm text-center">
                 접속 기록이 없습니다.
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 'bold'}} width={110} />
                  <Tooltip cursor={{fill: 'transparent'}} formatter={(val: any) => [`${Number(val).toLocaleString()}건`, '접속 수']} />
                  <Bar dataKey="val" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={26} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
