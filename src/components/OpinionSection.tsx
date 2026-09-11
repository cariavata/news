import React, { useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';
import ArticleThumbnail from './ArticleThumbnail';

export default function OpinionSection() {
  const { articles, fetchArticlesByCategory, categoryFetchStatus } = useAppStore();
  
  useEffect(() => {
    fetchArticlesByCategory('opinion');
  }, [fetchArticlesByCategory]);

  const opinionArticles = articles
    .filter(a => a.categoryId === 'opinion' || (a as any).category === 'opinion')
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 4);

  return (
    <section className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden text-white w-full">
      <div className="p-6 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
          <h2 className="text-2xl font-serif font-bold text-white">전문가 칼럼 / 오피니언</h2>
        </div>
        <Link to="/category/opinion" className="text-xs font-bold font-sans text-blue-400 hover:text-blue-300 tracking-widest flex items-center gap-1 group">
          전체 보기 
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      {opinionArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {opinionArticles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} className="p-6 hover:bg-slate-800/80 transition-colors group cursor-pointer flex flex-col h-full block">
              {/* Text-based Thumbnail */}
              <ArticleThumbnail 
                article={article} 
                categoryName="오피니언" 
                aspectRatio="video" 
                className="rounded-xl mb-4 w-full shrink-0 shadow-md border border-slate-800" 
              />
              
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors leading-snug break-keep line-clamp-2">
                {article.title}
              </h3>
              
              {/* Doctor Specialist Profile Photo & Info */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-800">
                {article.doctorImage ? (
                  <img 
                    src={article.doctorImage} 
                    className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0 shadow" 
                    alt={article.doctorName || '전문의'} 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-white text-sm font-bold tracking-tight truncate">
                    {article.doctorName || article.author || '전문가'}
                  </span>
                  {article.doctorSpecialty && (
                    <span className="text-emerald-400 text-xs font-medium tracking-tight truncate">
                      {article.doctorSpecialty}
                    </span>
                  )}
                  {article.hospitalName && (
                    <span className="text-slate-400 text-[11px] truncate">
                      {article.hospitalName}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-sm">
          등록된 전문가 칼럼 / 오피니언이 없습니다.
        </div>
      )}
    </section>
  );
}
