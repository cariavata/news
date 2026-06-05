import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ArrowLeft, Link as LinkIcon, Share2 } from 'lucide-react';

declare global {
  interface Window {
    Kakao: any;
  }
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.85 1.83 5.352 4.606 6.786-.15 1.05-.583 3.655-.605 3.823-.028.21.08.204.168.14.07-.052 3.107-2.128 4.34-3.03.483.072.98.11 1.49.11 5.523 0 10-3.582 10-8s-4.477-8-10-8z"/>
  </svg>
);

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, categories, seoSettings } = useAppStore();
  const article = articles.find(a => a.id === id);

  React.useEffect(() => {
    if (seoSettings?.kakaoAppKey && !window.Kakao) {
      const script = document.createElement('script');
      script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js';
      script.async = true;
      script.onload = () => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
          window.Kakao.init(seoSettings.kakaoAppKey);
        }
      };
      document.head.appendChild(script);
    } else if (window.Kakao && !window.Kakao.isInitialized() && seoSettings?.kakaoAppKey) {
      window.Kakao.init(seoSettings.kakaoAppKey);
    }
  }, [seoSettings?.kakaoAppKey]);

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
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <article className="col-span-1 lg:col-span-8 bg-white border border-slate-200 p-6 sm:p-10 lg:p-12 rounded-lg shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
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
            {article.excerpt}
          </div>

          {article.imageUrl && (
            <div className="mb-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
              <img src={article.imageUrl} alt="기사 대표 이미지" className="w-full h-auto max-h-[600px] object-cover" />
            </div>
          )}

          <div className="prose prose-slate prose-lg max-w-none font-sans text-slate-800 leading-[1.8] break-keep whitespace-pre-wrap">
            {article.content}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition">
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
                onClick={() => {
                  if (!seoSettings?.kakaoAppKey) {
                    alert('관리자 모드의 [기본 정보 및 검색 최적화]에서 카카오 자바스크립트 앱 키를 먼저 등록해주세요.\n(카카오 디벨로퍼스에서 발급)');
                    return;
                  }
                  
                  if (window.Kakao && window.Kakao.isInitialized()) {
                    window.Kakao.Share.sendDefault({
                      objectType: 'feed',
                      content: {
                        title: article.title,
                        description: article.excerpt,
                        imageUrl: article.imageUrl || seoSettings.logoUrl || 'https://via.placeholder.com/800x400?text=News',
                        link: {
                          mobileWebUrl: window.location.href,
                          webUrl: window.location.href,
                        },
                      },
                      buttons: [
                        {
                          title: '기사 보기',
                          link: {
                            mobileWebUrl: window.location.href,
                            webUrl: window.location.href,
                          },
                        },
                      ],
                    });
                  } else {
                    alert('카카오 SDK 로딩 중이거나 초기화에 실패했습니다.');
                  }
                }}
                className="w-10 h-10 flex items-center justify-center bg-[#FEE500] hover:bg-[#FDD800] text-[#000000] rounded-full transition shadow-sm"
                title="카카오톡 공유"
              >
                <KakaoIcon />
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
        
        <div className="col-span-1 lg:col-span-4">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
