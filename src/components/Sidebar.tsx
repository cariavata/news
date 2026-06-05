import { TrendingUp, LayoutGrid } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';

export default function Sidebar() {
  const { articles, adBanner } = useAppStore();
  const trending = articles
    .filter(a => a.isTrending)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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
            <li key={article.id} className="flex gap-4 group cursor-pointer items-start">
              <span className="text-4xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors font-serif italic leading-none mt-1">
                {i + 1}
              </span>
              <h4 className="text-slate-800 font-bold font-serif text-[17px] leading-tight group-hover:text-red-700 transition-colors break-keep">
                {article.title}
              </h4>
            </li>
          ))}
          {trending.length === 0 && (
            <li className="text-sm text-slate-500">인기 기사가 없습니다.</li>
          )}
        </ul>
      </div>

      {/* Ad Placeholder Banner Slot */}
      {adBanner.imageUrl ? (
        <a href={adBanner.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="block relative group">
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm z-10">
            광고
          </div>
          <img src={adBanner.imageUrl} alt="Advertisement" className="w-full h-auto object-cover border border-slate-200" />
        </a>
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
