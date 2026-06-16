import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';
import { useAppStore } from '../store/useArticleStore';
import { format, subDays, startOfDay } from 'date-fns';
import { RotateCcw } from 'lucide-react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const { analytics, globalSearchKeywords, resetAnalytics } = useAppStore();

  const handleReset = () => {
    if (window.confirm('모든 방문자 통계 및 검색어 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetAnalytics();
      alert('초기화 되었습니다.');
    }
  };

  const generateChartData = (days: number) => {
    const data = [];
    const today = startOfDay(new Date());
    for (let i = days - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const displayStr = format(d, 'MM/dd');
      data.push({
        name: displayStr,
        visitors: analytics.dailyViews[dateStr] || 0
      });
    }
    return data;
  };

  const getData = () => {
    if (timeRange === 'week') return generateChartData(7);
    if (timeRange === 'month') return generateChartData(30);
    return generateChartData(7);
  };

  const keywords = [...globalSearchKeywords]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const deviceData = Object.entries(analytics.devices).map(([name, val]) => ({
    name, val
  })).sort((a, b) => b.val - a.val);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold font-sans text-slate-800">방문자 통계</h1>
            <p className="text-sm text-slate-500 mt-1">사이트 전체의 일별 트래픽 트렌드를 확인합니다. (이 시점부터 실시간 적용됨)</p>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex bg-white rounded-md border border-slate-300 p-1">
              {(['week', 'month'] as const).map(range => (
                <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-sm transition ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {range === 'week' ? '주간' : '월간'}
                </button>
              ))}
            </div>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition text-sm font-bold border border-red-200"
            >
              <RotateCcw className="w-4 h-4" /> 통계 초기화
            </button>
          </div>
        </div>

        <div className="p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col">
          <h2 className="text-lg font-bold font-sans text-slate-800 mb-6">주요 유입 검색어</h2>
          {keywords.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium pb-8 text-sm text-center">
              수집된 검색어 데이터가 없습니다.<br/>(검색 기능을 통해 유입된 키워드가 표시됩니다)
            </div>
          ) : (
            <ul className="space-y-4 flex-1">
              {keywords.map((kw, i) => (
                <li key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-serif font-bold italic text-lg w-6">{i + 1}</span>
                    <span className="font-medium text-slate-700 group-hover:text-slate-900">{kw.keyword}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 flex items-center justify-center rounded text-xs font-mono font-bold">
                    {kw.count.toLocaleString()}건
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-[400px] flex flex-col">
          <h2 className="text-lg font-bold font-sans text-slate-800 mb-6">디바이스 환경 분류</h2>
          <div className="flex-1 w-full h-full">
            {deviceData.length === 0 ? (
               <div className="flex-1 flex h-full items-center justify-center text-slate-400 font-medium pb-8 text-sm text-center">
                 접속 기록이 없습니다.
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
