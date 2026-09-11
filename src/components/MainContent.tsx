import { Clock, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';
import { formatRelativeTime } from '../lib/dateUtils';
import { Link } from 'react-router-dom';
import OpinionSection from './OpinionSection';
import ArticleThumbnail from './ArticleThumbnail';

export default function MainContent() {
  const { articles, categories, hasFetchedInitialArticles } = useAppStore();
  
  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || '';

  // Always sort articles by date descending (newest first)
  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Top 4 most recent articles for the hero grid (ensures latest articles show up at the top)
  const featuredArticles = sortedArticles.slice(0, 4);

  if (!hasFetchedInitialArticles && articles.length === 0) {
    return (
      <div className="flex flex-col gap-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="bg-slate-200 rounded-lg aspect-square w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-7 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section (Featured Articles) */}
      {featuredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {featuredArticles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} className="group cursor-pointer flex flex-col">
              <ArticleThumbnail 
                article={article} 
                categoryName={getCategoryName(article.categoryId)} 
                aspectRatio="square" 
                className="rounded-xl mb-4" 
              />
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-3 tracking-wider">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatRelativeTime(article.createdAt)}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-[1.3] mb-3 group-hover:text-emerald-700 transition-colors break-keep line-clamp-2">
                {article.title}
              </h2>
              <p className="text-[15px] text-slate-600 font-sans leading-relaxed break-keep line-clamp-2">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Sections by Category */}
      {categories.map(category => {
        if (category.id === 'opinion') {
          return <OpinionSection key={category.id} />;
        }

        const categoryArticles = articles
          .filter(a => (a.categoryId === category.id || (a as any).category === category.id))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (categoryArticles.length === 0) return null;

        const isListCategory = ['checkup', 'womens-health', 'spine-joint', 'oriental-med'].includes(category.id);

        return (
          <section key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-5 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 sm:h-8 bg-emerald-600 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{category.name}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="text-[11px] sm:text-xs font-bold font-sans text-emerald-700 hover:text-emerald-800 tracking-widest flex items-center gap-1 group">
                기사 전체 보기 
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Desktop Grid and Default Mobile Layout */}
            <div className={`grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 ${isListCategory ? 'hidden md:grid' : ''}`}>
              {categoryArticles.slice(0, 3).map(article => (
                <Link to={`/article/${article.id}`} key={article.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full block">
                  <ArticleThumbnail 
                    article={article} 
                    categoryName={category.name} 
                    aspectRatio="video" 
                    className="rounded-lg mb-5 shrink-0" 
                  />
                  <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">
                    {category.name}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-auto break-keep pt-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>

            {/* Mobile List Layout for Specific Categories */}
            {isListCategory && (
              <div className="flex flex-col md:hidden divide-y divide-slate-100">
                {categoryArticles.slice(0, 4).map(article => (
                  <Link to={`/article/${article.id}`} key={article.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                      <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug break-keep line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono mt-auto">
                        {formatRelativeTime(article.createdAt)}
                      </span>
                    </div>
                    <ArticleThumbnail 
                      article={article} 
                      categoryName={category.name} 
                      aspectRatio="square" 
                      showBadge={false} 
                      className="w-[90px] h-[90px] shrink-0 rounded-xl" 
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
