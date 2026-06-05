import { Clock, User, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function MainContent() {
  const { articles, categories } = useAppStore();
  const featuredArticle = articles.find(a => a.isFeatured);
  
  // Get up to 3 health articles
  const healthArticles = articles
    .filter(a => a.categoryId.includes('health') || categories.some(c => c.id === a.categoryId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section */}
      {featuredArticle && (
        <article className="group cursor-pointer">
          <div className="relative overflow-hidden mb-6 bg-slate-100">
            {featuredArticle.imageUrl && (
              <img 
                src={featuredArticle.imageUrl} 
                alt={featuredArticle.title} 
                className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 tracking-wider">
            <span className="text-red-700">주요 기사</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(featuredArticle.createdAt), { addSuffix: true, locale: ko })}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {featuredArticle.author}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.2] mb-5 group-hover:text-slate-700 transition-colors break-keep">
            {featuredArticle.title}
          </h1>
          <p className="text-lg text-slate-600 font-sans leading-relaxed md:w-5/6 break-keep">
            {featuredArticle.excerpt}
          </p>
        </article>
      )}

      {/* Health & Wellness Section - "Fresh & Trustworthy" Theme */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Section Header */}
        <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-slate-900">최신 주요 기사</h2>
            <span className="text-emerald-700 font-sans font-medium hidden sm:inline-block ml-2">— 건강 및 의학</span>
          </div>
          <button className="text-xs font-bold font-sans text-emerald-700 hover:text-emerald-800 tracking-widest flex items-center gap-1 group">
            기사 전체 보기 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {healthArticles.map(article => (
            <article key={article.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full">
              {article.imageUrl && (
                <div className="rounded overflow-hidden mb-5">
                  <img src={article.imageUrl} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
                </div>
              )}
              <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">
                {getCategoryName(article.categoryId)}
              </span>
              <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
                {article.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-auto break-keep">
                {article.excerpt}
              </p>
            </article>
          ))}

        </div>
      </section>
    </div>
  )
}
