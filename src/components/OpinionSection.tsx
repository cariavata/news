import React from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Link } from 'react-router-dom';
import { ArrowRight, User } from 'lucide-react';

export default function OpinionSection() {
  const { articles } = useAppStore();
  const opinionArticles = articles
    .filter(a => a.categoryId === 'opinion')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
            <Link to={`/article/${article.id}`} key={article.id} className="p-6 hover:bg-slate-800 transition-colors group cursor-pointer flex flex-col h-full block">
              {article.imageUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden mb-4 border-2 border-slate-700">
                  <img src={article.imageUrl} className="w-full h-full object-cover" alt={article.author} />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 border-2 border-slate-700 text-slate-500 shrink-0">
                  <User className="w-6 h-6" />
                </div>
              )}
              <h3 className="text-lg font-serif font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors leading-snug break-keep">
                {article.title}
              </h3>
              <span className="text-blue-400 text-xs font-bold tracking-widest block mt-auto">
                {article.author || '전문가'}
              </span>
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
