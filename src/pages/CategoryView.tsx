import { useEffect, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import VisualSection from '../components/VisualSection';
import ArticleThumbnail from '../components/ArticleThumbnail';
import { formatRelativeTime } from '../lib/dateUtils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function CategoryView() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { articles, categories, fetchArticlesByCategory } = useAppStore();
  const listTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categoryId) {
      fetchArticlesByCategory(categoryId);
    }
  }, [categoryId, fetchArticlesByCategory]);

  const category = categories.find(c => c.id === categoryId);
  const categoryArticles = articles
    .filter(a => a.categoryId === categoryId || (a as any).category === categoryId)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const totalPages = Math.max(1, Math.ceil(categoryArticles.length / ITEMS_PER_PAGE));
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, totalPages);

  const paginatedArticles = categoryArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setSearchParams(newPage === 1 ? {} : { page: String(newPage) });
    if (listTopRef.current) {
      const y = listTopRef.current.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = (): (number | 'ellipsis')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      start = 2;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    if (start > 2) pages.push('ellipsis');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />
      
      <VisualSection 
        title={category ? `${category.name} 섹션` : '전체 기사'}
        subtitle={`해당 섹션에 총 ${categoryArticles.length}개의 기사가 게재되어 있습니다.`}
        badgeTag={category ? category.name : 'CATEGORY'}
        badgeDetail="실시간 저널리즘 브리핑"
        compact={true}
      />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div ref={listTopRef} className="col-span-1 lg:col-span-9 flex flex-col gap-10">
          <div className="flex flex-col gap-8">
              {categoryArticles.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
                  <p className="text-slate-500 font-medium font-sans">해당 카테고리에 등록된 기사가 없습니다.</p>
                </div>
              ) : (
                paginatedArticles.map(article => (
                  <Link to={`/article/${article.id}`} key={article.id} className="block group">
                    <article className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 group-hover:border-slate-300 group-hover:shadow-md transition duration-300">
                      <ArticleThumbnail 
                        article={article} 
                        categoryName={category?.name} 
                        aspectRatio="square" 
                        className="sm:w-2/5 shrink-0 rounded-lg" 
                      />
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
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 font-mono">
                            <span>{article.author}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(article.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav aria-label="페이지네이션" className="flex justify-center items-center gap-1 sm:gap-2 mt-4 font-mono">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="이전 페이지"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((pageItem, idx) =>
                    pageItem === 'ellipsis' ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-6 sm:w-8 h-9 sm:h-10 flex items-center justify-center text-slate-400 text-sm select-none"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageItem}
                        type="button"
                        onClick={() => handlePageChange(pageItem)}
                        aria-current={currentPage === pageItem ? 'page' : undefined}
                        className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border text-sm font-bold transition ${
                          currentPage === pageItem
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageItem}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="다음 페이지"
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </nav>
              )}
            </div>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
