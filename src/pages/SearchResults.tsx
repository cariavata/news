import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User } from 'lucide-react';

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
      
      <div className="relative w-full overflow-hidden bg-[#020813] py-12 lg:py-20 border-b border-blue-900/30">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020813] to-[#020813] bg-gradient-x">
          <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-blue-600/30 rounded-full blur-[120px] animate-float mix-blend-screen" />
          <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-cyan-500/15 rounded-full blur-[100px] animate-float-delayed mix-blend-screen" />
        </div>
        
        <div className="absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.15)_1px,transparent_1px)] bg-[size:60px_60px] origin-top animate-grid-flow" style={{ transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)' }} />
        </div>

        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-lg mb-4 tracking-tight inline-block">
            검색 결과: "{query}"
          </h1>
          <p className="text-blue-200/80 font-medium text-sm sm:text-base mt-2 flex items-center justify-center sm:justify-start gap-2">
            <span className="w-4 h-[1px] bg-blue-400/50" />
            총 <span className="text-white font-bold">{searchResults.length}</span>건의 기사가 검색되었습니다.
            <span className="w-4 h-[1px] bg-blue-400/50" />
          </p>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-8">
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
                    <div className="mt-auto flex flex-col gap-3 pt-4">
                      {(article.doctorName || article.hospitalName) && (
                        <div className="flex items-center gap-3 w-fit">
                          {article.doctorImage ? (
                            <img src={article.doctorImage} alt={article.doctorName || '의사 사진'} className="hidden sm:block w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 shadow-sm" />
                          ) : (
                            <div className="hidden sm:flex w-9 h-9 rounded-full bg-slate-100 items-center justify-center shrink-0 border border-slate-200">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            {article.doctorName && (
                              <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                {article.doctorName}
                                {article.doctorSpecialty && <span className="text-emerald-600 font-medium text-xs break-keep">{article.doctorSpecialty}</span>}
                              </div>
                            )}
                            {article.hospitalName && <div className="text-[11px] sm:text-xs text-slate-500 break-keep">{article.hospitalName}</div>}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )})
          )}
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
