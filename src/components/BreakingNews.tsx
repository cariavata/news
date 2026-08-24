import React from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';

export default function BreakingNews() {
  const { articles } = useAppStore();
  
  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const mainArticles = sortedArticles.slice(0, 8);

  if (mainArticles.length === 0) return null;

  return (
    <div className="bg-[#0b1329] text-slate-100 border-b border-slate-800 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-stretch">
        <div className="bg-[#111c38] text-emerald-400 font-bold px-4 sm:px-6 py-2.5 flex items-center gap-2 z-10 shrink-0 uppercase tracking-wider text-xs sm:text-sm border-r border-slate-800">
          <Newspaper className="w-4 h-4 text-emerald-400" />
          <span>주요뉴스</span>
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-2.5 [animation-duration:110s]">
            <div className="flex items-center gap-8 px-8 shrink-0">
              {mainArticles.map(article => (
                <div key={article.id} className="flex items-center gap-8">
                  <Link to={`/article/${article.id}`} className="hover:text-emerald-300 text-xs sm:text-sm font-medium tracking-wide transition-colors">
                    {article.title}
                  </Link>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 block"></span>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless scrolling */}
            <div className="flex items-center gap-8 px-8 shrink-0" aria-hidden="true">
              {mainArticles.map(article => (
                <div key={`dup-${article.id}`} className="flex items-center gap-8">
                  <Link to={`/article/${article.id}`} className="hover:text-emerald-300 text-xs sm:text-sm font-medium tracking-wide transition-colors">
                    {article.title}
                  </Link>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 block"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

