import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import AdsenseBanner from '../components/AdsenseBanner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, Link as LinkIcon, Share2, Loader2 } from 'lucide-react';
import { renderContentWithLinks } from '../lib/renderLinks';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, categories, adBanners, seoSettings, incrementArticleViews, fetchArticleById } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  const article = articles.find(a => a.id === id);

  useEffect(() => {
    const init = async () => {
      if (id) {
        setLoading(true);
        if (!article) {
          await fetchArticleById(id);
        }
        incrementArticleViews(id);
        setLoading(false);
      }
    };
    init();
  }, [id, fetchArticleById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center bg-white p-10 rounded-lg shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">존재하지 않거나 삭제된 기사입니다.</h1>
            <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-6 py-3 rounded-md font-bold hover:bg-slate-800 transition">이전 페이지로 돌아가기</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryName = categories.find(c => c.id === article.categoryId)?.name || '일반';

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Helmet>
        <title>{article.title} - {seoSettings.siteName || 'DAILY PULSE'}</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="col-span-1 lg:col-span-9 bg-white border border-slate-200 p-6 sm:p-10 lg:p-12 rounded-lg shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="mb-8">
            <Link to={`/category/${article.categoryId}`} className="text-emerald-600 font-bold tracking-widest text-sm mb-4 inline-block hover:text-emerald-800 transition">
              {categoryName}
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-[1.3] mb-6 break-keep">
              {article.title}
            </h1>
            <div className="flex items-center justify-between border-y border-slate-100 py-4 mb-8 text-sm">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-serif italic">E</span>
                {article.author}
              </span>
              <span className="text-slate-500 font-mono">
                {format(new Date(article.createdAt), 'yyyy. MM. dd HH:mm', { locale: ko })}
              </span>
            </div>
          </div>

          <div className="mb-8 text-lg text-slate-600 font-semibold leading-relaxed p-6 bg-slate-50 rounded-r-lg border-l-4 border-slate-900 break-keep">
            {renderContentWithLinks(article.excerpt)}
          </div>

          {article.imageUrl && (
            <div className="mb-10 mx-auto rounded-lg overflow-hidden border border-slate-100 bg-slate-50 max-w-2xl aspect-square">
              <img src={article.imageUrl} alt="기사 대표 이미지" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-slate prose-lg max-w-none font-sans text-slate-800 leading-[1.8] break-keep">
            {renderContentWithLinks(article.content)}
          </div>

          {article.categoryId === 'opinion' && article.doctorName && (
            <div className="mt-12 bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
              {article.doctorImage ? (
                <img src={article.doctorImage} alt={article.doctorName} className="w-[128px] h-[128px] object-cover rounded-2xl border border-slate-200 shrink-0 shadow-sm" />
              ) : (
                <div className="w-[128px] h-[128px] rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center shrink-0">
                  <span className="text-slate-400 font-serif italic text-3xl">D</span>
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="text-sm font-bold text-emerald-600 tracking-widest mb-1 uppercase">의학 자문 / 칼럼니스트</div>
                <h3 className="text-xl font-bold text-slate-900 mx-1">{article.doctorName}</h3>
                <p className="text-slate-600 font-medium mb-1">{article.doctorSpecialty}</p>
                {article.hospitalName && (
                  <p className="text-slate-500 text-sm font-medium">{article.hospitalName}</p>
                )}
              </div>
            </div>
          )}

          {/* In-article Ad Banner */}
          {adBanners && adBanners.length > 0 && (
            <div className="mt-12 pt-6 border-t border-slate-100">
              {(() => {
                const banner = adBanners[0];
                const adClient = seoSettings.googleAdsenseClient || "ca-pub-6799823492487492";
                if (banner.type === 'adsense') {
                  return (
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 relative overflow-hidden text-center min-h-[140px] flex items-center justify-center">
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm z-10 pointer-events-none">
                        광고
                      </div>
                      <AdsenseBanner client={adClient} slot={banner.adsenseSlot!} />
                    </div>
                  );
                }
                return (
                  <a href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg border border-slate-200">
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm z-10">
                      광고
                    </div>
                    <img src={banner.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[180px] object-cover" />
                  </a>
                );
              })()}
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
            <button onClick={() => navigate(article.categoryId ? `/category/${article.categoryId}` : '/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition">
              <ArrowLeft className="w-5 h-5" /> 목록으로
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank');
                }}
                className="w-10 h-10 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full transition shadow-sm"
                title="X (트위터) 공유"
              >
                <XIcon />
              </button>
              <button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('링크가 클립보드에 복사되었습니다.');
                  } catch (err) {
                    console.error('Copy failed:', err);
                  }
                }}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition shadow-sm border border-slate-200"
                title="단축 URL 복사"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>
        
        <div className="col-span-1 lg:col-span-3">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
