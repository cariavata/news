import { TrendingUp, LayoutGrid } from 'lucide-react';

export default function Sidebar() {
  const trending = [
    "거대 기술 기업들, 통합 AI 규제 합의안 공동 발표",
    "글로벌 기후 정상회담, 구속력 있는 서약과 함께 성공적 폐막",
    "마라톤 세계 신기록 경신으로 육상계 큰 충격",
    "역사적인 도심 개발 프로젝트에 대한 새로운 세부 정보 공개",
    "중앙은행, 4분기 기준 금리 인하 가능성 강력 시사"
  ];

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
          {trending.map((title, i) => (
            <li key={i} className="flex gap-4 group cursor-pointer items-start">
              <span className="text-4xl font-bold text-slate-200 group-hover:text-slate-300 transition-colors font-serif italic leading-none mt-1">
                {i + 1}
              </span>
              <h4 className="text-slate-800 font-bold font-serif text-[17px] leading-tight group-hover:text-red-700 transition-colors break-keep">
                {title}
              </h4>
            </li>
          ))}
        </ul>
      </div>

      {/* Ad Placeholder Banner Slot */}
      <div className="bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 h-[400px] flex flex-col items-center justify-center text-center p-6 relative group cursor-pointer">
        <div className="absolute top-2 right-2 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
          Advertisement
        </div>
        <LayoutGrid className="w-8 h-8 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
        <h4 className="font-sans font-bold tracking-widest uppercase text-sm text-slate-400">프리미엄 광고 스페이스</h4>
        <p className="text-xs text-slate-400 mt-2 font-sans max-w-[200px] break-keep">최대 브랜드 노출을 위한 전략적 위치입니다.</p>
      </div>
      
    </aside>
  )
}
