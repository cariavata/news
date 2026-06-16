import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import OpinionSection from '../components/OpinionSection';
import CardNewsList from '../components/CardNewsList';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { User, Loader2 } from 'lucide-react';

export default function CategoryView() {
  const { categoryId } = useParams();
  const { articles, categories, fetchArticlesByCategory, categoryFetchStatus } = useAppStore();
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    if (categoryId) {
      fetchArticlesByCategory(categoryId);
    }
  }, [categoryId, fetchArticlesByCategory]);

  const category = categories.find(c => c.id === categoryId);
  const categoryArticles = articles
    .filter(a => a.categoryId === categoryId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasMore = categoryId ? categoryFetchStatus[categoryId]?.hasMore : false;

  const handleLoadMore = async () => {
    if (!categoryId || loadingMore) return;
    setLoadingMore(true);
    await fetchArticlesByCategory(categoryId, true);
    setLoadingMore(false);
  };

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
            {category ? category.name : '전체 기사'}
          </h1>
          <p className="text-blue-200/80 font-medium text-sm sm:text-base mt-2 flex items-center justify-center sm:justify-start gap-2">
            <span className="w-4 h-[1px] bg-blue-400/50" />
            해당 섹션에 총 <span className="text-white font-bold">{categoryArticles.length}</span>개의 기사가 있습니다.
            <span className="w-4 h-[1px] bg-blue-400/50" />
          </p>
        </div>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-10">
          {categoryId === 'cardnews' ? (
            <CardNewsList articles={categoryArticles} categoryName={category?.name || '카드뉴스'} />
          ) : (
            <div className="flex flex-col gap-8">
              {categoryArticles.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
                  <p className="text-slate-500 font-medium font-sans">해당 카테고리에 등록된 기사가 없습니다.</p>
                </div>
              ) : (
                categoryArticles.map(article => (
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
                ))
              )}
              {hasMore && categoryArticles.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center justify-center gap-2 px-8 py-3 bg-white border border-slate-300 rounded-md font-bold text-slate-700 hover:bg-slate-50 transition w-full sm:w-auto"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        불러오는 중...
                      </>
                    ) : (
                      '더보기'
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* 하단 전문가 칼럼 / 오피니언 리스트 */}
          {categoryId !== 'opinion' && categoryId !== 'cardnews' && (
            <OpinionSection />
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
