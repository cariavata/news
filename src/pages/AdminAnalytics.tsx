import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar 
} from 'recharts';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  // Mock Data
  const dailyData = [
    { name: '0시', visitors: 12 }, { name: '4시', visitors: 8 }, { name: '8시', visitors: 145 },
    { name: '12시', visitors: 280 }, { name: '16시', visitors: 230 }, { name: '20시', visitors: 390 }
  ];

  const weeklyData = [
    { name: '월', visitors: 1200 }, { name: '화', visitors: 1300 }, { name: '수', visitors: 1100 },
    { name: '목', visitors: 1400 }, { name: '금', visitors: 1800 }, { name: '토', visitors: 2100 },
    { name: '일', visitors: 2200 }
  ];

  const monthlyData = [
    { name: '1주차', visitors: 8000 }, { name: '2주차', visitors: 9200 }, 
    { name: '3주차', visitors: 8500 }, { name: '4주차', visitors: 11000 }
  ];

  const yearlyData = [
    { name: '1월', visitors: 28000 }, { name: '2월', visitors: 30000 }, { name: '3월', visitors: 27000 },
    { name: '4월', visitors: 32000 }, { name: '5월', visitors: 35000 }, { name: '6월', visitors: 41000 }
  ];

  const getData = () => {
    switch (timeRange) {
      case 'day': return dailyData;
      case 'week': return weeklyData;
      case 'month': return monthlyData;
      case 'year': return yearlyData;
      default: return weeklyData;
    }
  };

  const keywords = [
    { word: '척추관절 치료', count: 1450 },
    { word: '건강검진 예약', count: 1120 },
    { word: '임산부 건강관리', count: 850 },
    { word: '허리디스크 증상', count: 760 },
    { word: '한의학 침치료', count: 620 },
    { word: '여성 갱년기', count: 540 }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold font-sans text-slate-800">방문자 통계</h1>
            <p className="text-sm text-slate-500 mt-1">사이트 전체의 트래픽 트렌드를 확인합니다.</p>
          </div>
          <div className="flex bg-white rounded-md border border-slate-300 p-1">
            {(['day', 'week', 'month', 'year'] as const).map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-sm font-bold rounded-sm transition ${timeRange === range ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {range === 'day' ? '일' : range === 'week' ? '주' : range === 'month' ? '월' : '년'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 h-[400px]">
          <ResponsiveContainer w-full h-full>
            <AreaChart data={getData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
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
          <h2 className="text-lg font-bold font-sans text-slate-800 mb-6">주요 유입 키워드</h2>
          <ul className="space-y-4 flex-1">
            {keywords.map((kw, i) => (
              <li key={i} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-serif font-bold italic text-lg w-6">{i + 1}</span>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">{kw.word}</span>
                </div>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 flex items-center justify-center rounded text-xs font-mono font-bold">
                  {kw.count.toLocaleString()}건
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-[400px] flex flex-col">
          <h2 className="text-lg font-bold font-sans text-slate-800 mb-6">디바이스 / 브라우저</h2>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer w-full h-full>
              <BarChart data={[{name: 'Mo', val: 70}, {name: 'PC', val: 25}, {name: 'Tab', val: 5}]} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 'bold'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="val" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
