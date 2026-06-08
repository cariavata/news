import React from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function BreakingNews() {
  const { articles } = useAppStore();
  const breakingArticles = articles
    .filter(a => a.isBreaking)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Show at most 5 breaking news items

  if (breakingArticles.length === 0) return null;

  return (
    <div className="bg-red-700 text-white border-b border-red-800">
      <div className="max-w-7xl mx-auto flex items-stretch">
        <div className="bg-red-800 text-white font-bold px-4 sm:px-6 py-2.5 flex items-center gap-2 z-10 shrink-0 uppercase tracking-widest text-sm">
          <Zap className="w-4 h-4 fill-current" />
          속보
        </div>
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex w-fit animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-2.5">
            <div className="flex items-center gap-8 px-8 shrink-0">
              {breakingArticles.map(article => (
                <div key={article.id} className="flex items-center gap-8">
                  <Link to={`/article/${article.id}`} className="hover:underline text-sm font-medium tracking-wide">
                    {article.title}
                  </Link>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-50 block last:hidden"></span>
                </div>
              ))}
            </div>
            {/* Duplicate for seamless scrolling */}
            <div className="flex items-center gap-8 px-8 shrink-0" aria-hidden="true">
              {breakingArticles.map(article => (
                <div key={`dup-${article.id}`} className="flex items-center gap-8">
                  <Link to={`/article/${article.id}`} className="hover:underline text-sm font-medium tracking-wide">
                    {article.title}
                  </Link>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-50 block last:hidden"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
