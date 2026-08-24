import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Newspaper } from 'lucide-react';

interface NewsVisual {
  id: string;
  url: string;
  title: string;
  category: string;
}

// 12 curated high-definition news, press, office, media, and people images
const NEWS_VISUALS: NewsVisual[] = [
  {
    id: 'newsroom',
    url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1920&q=85',
    title: '현대적인 미디어 뉴스룸',
    category: '취재 & 현장'
  },
  {
    id: 'newspaper-reading',
    url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1920&q=85',
    title: '아침 신문과 커피',
    category: '지면 저널리즘'
  },
  {
    id: 'busy-city',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30ac4ce78?auto=format&fit=crop&w=1920&q=85',
    title: '도심의 활기찬 일상',
    category: '사회 현장'
  },
  {
    id: 'digital-journalism',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=85',
    title: '실시간 데이터 및 데스크',
    category: '디지털 뉴스'
  },
  {
    id: 'office-collaboration',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=85',
    title: '회의실 속 열정적인 기획',
    category: '데스크 심층취재'
  },
  {
    id: 'broadcast-camera',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=85',
    title: '방송 스튜디오 카메라',
    category: '생방송 뉴스'
  },
  {
    id: 'press-conference',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=85',
    title: '공식 기자회견 현장',
    category: '브리핑'
  },
  {
    id: 'library-research',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1920&q=85',
    title: '깊이 있는 학술 자료 조사',
    category: '기획 탐사'
  },
  {
    id: 'printing-press',
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1920&q=85',
    title: '인쇄와 신문 출판',
    category: '기록과 출판'
  },
  {
    id: 'medical-news',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1920&q=85',
    title: '보건의료 연구 및 기사',
    category: '의학 리포트'
  },
  {
    id: 'tech-computer',
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1920&q=85',
    title: '최신 IT 기술과 기사 작성',
    category: '테크 브리핑'
  },
  {
    id: 'podcast-mic',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1920&q=85',
    title: '인터뷰 오디오 팟캐스트',
    category: '오디오 미디어'
  }
];

interface VisualSectionProps {
  title?: string;
  subtitle?: string;
  badgeTag?: string;
  badgeDetail?: string;
  compact?: boolean;
}

export default function VisualSection({
  title,
  subtitle,
  badgeTag,
  badgeDetail,
  compact = false
}: VisualSectionProps = {}) {
  const { seoSettings } = useAppStore();
  
  const isEnabled = seoSettings.homeIntroEnabled !== false;
  const introText = title || seoSettings.homeIntroText || '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  // Auto rotate slideshow every 18 seconds for a relaxed viewing experience
  useEffect(() => {
    // Reset zoom animation on index change
    setZoom(false);
    const zoomTimeout = setTimeout(() => {
      setZoom(true);
    }, 50);

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_VISUALS.length);
    }, 18000);

    return () => {
      clearTimeout(zoomTimeout);
      clearInterval(interval);
    };
  }, [currentIndex]);

  if (!isEnabled && !title) {
    return null;
  }

  const currentVisual = NEWS_VISUALS[currentIndex];
  const activeBadgeTag = badgeTag || "LIVE PRESS";
  const activeBadgeDetail = badgeDetail || currentVisual.title;

  return (
    <div className="relative w-full overflow-hidden bg-[#020813] border-b border-slate-800/80">
      
      {/* Background Images with Cross-fade & Ken Burns Slow Zoom */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {NEWS_VISUALS.map((visual, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={visual.id}
              className={`absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{
                backgroundImage: `url(${visual.url})`,
                transform: isActive && zoom ? 'scale(1.08)' : 'scale(1.0)',
                transitionProperty: 'opacity, transform',
                transitionDuration: '1600ms, 12000ms',
                transitionTimingFunction: 'ease-in-out, linear'
              }}
            />
          );
        })}
      </div>

      {/* Lighter overlays so background images are clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020813]/90 via-[#020813]/40 to-[#020813]/60 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-black/25 z-10 pointer-events-none" />

      {/* Subtle News Grid Mesh overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] z-10" />

      {/* Main Content Area */}
      <div className={`relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[380px] ${compact ? 'py-14 sm:py-20' : 'py-20 sm:py-28'}`}>
        
        {/* Sensorial Editorial Live Badge */}
        <div className="mb-6 inline-flex items-center gap-3 px-4 sm:px-5 py-2 rounded-full bg-slate-950/75 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.15)] group transition-all duration-500 hover:border-emerald-400/50">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
          </div>
          <span className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] text-emerald-400 uppercase">
            {activeBadgeTag}
          </span>
          <div className="h-3 w-[1px] bg-slate-700/80" />
          <span className="text-xs sm:text-sm font-medium text-slate-200 tracking-wide">
            {activeBadgeDetail}
          </span>
        </div>

        {/* Main Headline with sharp contrast and readability */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight leading-[1.35] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] max-w-4xl break-keep">
          {introText}
        </h2>

        {subtitle && (
          <p className="mt-4 text-blue-200/90 font-medium text-sm sm:text-base flex items-center justify-center gap-2 drop-shadow">
            <span className="w-4 h-[1px] bg-blue-400/50" />
            {subtitle}
            <span className="w-4 h-[1px] bg-blue-400/50" />
          </p>
        )}

        {/* Decorative Divider */}
        <div className="mt-7 flex items-center justify-center gap-4">
          <div className="w-12 sm:w-24 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/80 to-emerald-400" />
          <div className="w-2.5 h-2.5 rotate-45 border border-emerald-400 bg-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
          <div className="w-12 sm:w-24 h-[2px] bg-gradient-to-l from-transparent via-emerald-500/80 to-emerald-400" />
        </div>

        {/* Dots progress indicator */}
        <div className="mt-7 flex items-center justify-center gap-1.5">
          {NEWS_VISUALS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentIndex
                  ? 'w-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
