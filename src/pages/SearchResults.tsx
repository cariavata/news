import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { articles, categories, trackSearch } = useAppStore();
  
  useEffect(() => {
    if (query.trim()) {
      trackSearch(query.trim());
    }
  }, [query, trackSearch]);

  const searchResults = articles
    .filter(a => 
      a.title.includes(query) || 
      a.excerpt.includes(query) || 
      a.content.includes(query)
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />
      
      <div className="bg-slate-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            검색 결과: "{query}"
          </h1>
          <p className="text-slate-400 font-medium text-sm sm:text-base">총 {searchResults.length}건의 기사가 검색되었습니다.</p>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">
          {searchResults.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
              <p className="text-slate-500 font-medium font-sans">"{query}"에 대한 검색 결과가 없습니다.</p>
            </div>
          ) : (
            searchResults.map(article => {
              const category = categories.find(c => c.id === article.categoryId);
              return (
              <Link to={`/article/${article.id}`} key={article.id} className="block group">
                <article className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 group-hover:border-slate-300 group-hover:shadow-md transition duration-300">
                  {article.imageUrl && (
                    <div className="sm:w-2/5 shrink-0 rounded overflow-hidden bg-slate-100">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-48 sm:h-full object-cover group-hover:scale-[1.03] transition duration-500" />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col pt-1">
                    <span className="text-emerald-600 font-bold text-xs tracking-widest mb-3 inline-block">
                      {category?.name || '일반 뉴스'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 leading-snug mb-3 group-hover:text-emerald-700 transition break-keep">
                      {article.title}
                    </h2>
                    <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed text-sm sm:text-base break-keep">
                      {article.excerpt}
                    </p>
                    <div className="mt-auto flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}</span>
                    </div>
                  </div>
                </article>
              </Link>
            )})
          )}
        </div>
        
        <div className="col-span-1 lg:col-span-4">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
