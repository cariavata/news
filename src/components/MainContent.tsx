import { Clock, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import OpinionSection from './OpinionSection';

export default function MainContent() {
  const { articles, categories } = useAppStore();
  const featuredArticles = articles.filter(a => a.isFeatured).slice(0, 4);
  
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section (Featured Articles) */}
      {featuredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {featuredArticles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} className="group cursor-pointer flex flex-col">
              <div className="relative overflow-hidden mb-4 bg-slate-100 rounded-lg aspect-square">
                {article.imageUrl && (
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
                  />
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-red-700 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 tracking-wider shadow-sm uppercase">주요 기사</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-3 tracking-wider">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-[1.3] mb-3 group-hover:text-red-700 transition-colors break-keep line-clamp-2">
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
          .filter(a => a.categoryId === category.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (categoryArticles.length === 0) return null;

        if (category.id === 'cardnews') {
          return (
            <section key={category.id} className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative border border-slate-800">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -rotate-45 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl rotate-45 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
              
              <div className="p-6 sm:px-8 pt-8 flex items-end justify-between relative z-10 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="text-blue-400">#</span>
                    {category.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 font-medium">핫한 이슈를 한눈에 보는 카드뉴스</p>
                </div>
                <Link to={`/category/${category.id}`} className="text-xs font-bold font-sans text-blue-400 hover:text-blue-300 tracking-widest flex items-center gap-1 group bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded-full transition-all">
                  전체 보기 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex overflow-x-auto gap-4 px-6 sm:px-8 pb-8 snap-x snap-mandatory hide-scrollbar relative z-10">
                {categoryArticles.slice(0, 5).map((article, idx) => (
                  <Link to={`/category/${category.id}`} key={article.id} className="snap-start shrink-0 w-[240px] sm:w-[280px] group cursor-pointer flex flex-col relative block">
                    <div className="aspect-square w-full rounded-xl overflow-hidden relative shadow-lg bg-slate-800">
                      {article.cardNewsImages && article.cardNewsImages.length > 0 ? (
                        <img src={article.cardNewsImages[0]} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Pagination Pill */}
                      {article.cardNewsImages && article.cardNewsImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold font-mono tracking-widest shadow-sm">
                          {article.cardNewsImages.length}장
                        </div>
                      )}
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-serif font-bold text-lg leading-snug line-clamp-2 drop-shadow-md group-hover:text-blue-200 transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-6 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                <h2 className="text-2xl font-serif font-bold text-slate-900">{category.name}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="text-xs font-bold font-sans text-emerald-700 hover:text-emerald-800 tracking-widest flex items-center gap-1 group">
                기사 전체 보기 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {categoryArticles.slice(0, 3).map(article => (
                <Link to={`/article/${article.id}`} key={article.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full block">
                  {article.imageUrl && (
                    <div className="rounded overflow-hidden mb-5 shrink-0 aspect-square">
                      <img src={article.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
                    </div>
                  )}
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
          </section>
        );
      })}
    </div>
  );
}
