import React, { useEffect } from 'react';
import { TrendingUp, LayoutGrid } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function Sidebar() {
  const { articles, adBanners, seoSettings } = useAppStore();
  const trending = [...articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  useEffect(() => {
    try {
      const adsCount = document.querySelectorAll('.adsbygoogle').length;
      if (adsCount > 0 && typeof window !== 'undefined') {
        const pushedAds = window.adsbygoogle?.length || 0;
        if (pushedAds < adsCount) {
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [adBanners]);

  return (
    <aside className="w-full flex flex-col gap-10">
      
      {/* Trending / Most Read Widget */}
      <div className="bg-white p-6 sm:p-8 border border-slate-200 rounded-none relative shadow-[4px_4px_0px_0px_rgba(15,23,42,0.05)]">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-900" />
        
        <h3 className="text-lg font-sans font-bold text-slate-900 flex items-center gap-2 mb-6 tracking-widest">
          <TrendingUp className="w-5 h-5 text-red-700" />
          실시간 많이 본 뉴스
        </h3>
        
        <ul className="space-y-6">
          {trending.map((article, i) => (
            <li key={article.id} className="flex gap-4 group items-start">
              <span className="text-4xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors font-serif italic leading-none mt-1 shrink-0 w-8">
                {i + 1}
              </span>
              <Link to={`/article/${article.id}`} className="block flex-1 mt-1 group-hover:text-red-700 transition-colors">
                <h4 className="text-slate-800 font-bold font-serif text-[15px] leading-[1.3] group-hover:text-red-700 transition-colors break-keep">
                  {article.title}
                </h4>
                <div className="text-xs text-slate-400 mt-1 font-mono tracking-tighter">조회수 {article.views || 0}</div>
              </Link>
            </li>
          ))}
          {trending.length === 0 && (
            <li className="text-sm text-slate-500">인기 기사가 없습니다.</li>
          )}
        </ul>
      </div>

      {/* Ad Banners Slot */}
      {adBanners.length > 0 ? (
        <div className="flex flex-col gap-6">
          {adBanners.map(banner => {
            if (banner.type === 'adsense' && seoSettings.googleAdsenseClient) {
              return (
                <div key={banner.id} className="block relative w-full overflow-hidden bg-slate-50 min-h-[250px]">
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm z-10 pointer-events-none">
                    광고
                  </div>
                  <ins 
                    className="adsbygoogle"
                    style={{display:"block"}}
                    data-ad-client={seoSettings.googleAdsenseClient}
                    data-ad-slot={banner.adsenseSlot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  ></ins>
                </div>
              );
            }
            return (
              <a key={banner.id} href={banner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block relative group">
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm z-10">
                  광고
                </div>
                {banner.imageUrl ? (
                 <img src={banner.imageUrl} alt="Advertisement" className="w-full h-auto object-cover border border-slate-200" />
                ) : (
                  <div className="w-full h-64 bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-slate-400 text-sm font-bold">이미지 없음</span>
                  </div>
                )}
              </a>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 h-[400px] flex flex-col items-center justify-center text-center p-6 relative group cursor-pointer">
          <div className="absolute top-2 right-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
            Advertisement
          </div>
          <LayoutGrid className="w-8 h-8 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
          <h4 className="font-sans font-bold tracking-widest uppercase text-sm text-slate-400">프리미엄 광고 스페이스</h4>
          <p className="text-xs text-slate-400 mt-2 font-sans max-w-[200px] break-keep">관리자 페이지에서 광고 이미지를 설정하세요.</p>
        </div>
      )}
      
    </aside>
  )
}
