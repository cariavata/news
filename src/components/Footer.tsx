export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 mt-16 border-t-[8px] border-slate-900">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">데일리 펄스</h2>
            <p className="text-sm font-sans max-w-sm mb-6 leading-relaxed break-keep">
              연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.
            </p>
            <div className="flex gap-4">
               {/* Social placeholders */}
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer" />
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer" />
               <div className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 cursor-pointer" />
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs tracking-widest mb-3">섹션</h4>
            <a href="#" className="text-sm hover:text-white transition">국제 뉴스</a>
            <a href="#" className="text-sm hover:text-white transition">정치 & 경제</a>
            <a href="#" className="text-sm text-emerald-500 hover:text-emerald-400 transition font-medium">건강 & 웰니스</a>
            <a href="#" className="text-sm hover:text-white transition">과학 & 기술</a>
          </div>

          {/* Corporate */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs tracking-widest mb-3">회사 소개</h4>
            <a href="#" className="text-sm hover:text-white transition">소개</a>
            <a href="#" className="text-sm hover:text-white transition">편집 가이드라인</a>
            <a href="#" className="text-sm hover:text-white transition">채용 정보</a>
            <a href="#" className="text-sm hover:text-white transition">개인정보 처리방침 및 약관</a>
          </div>
       </div>

       <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} 데일리 펄스 미디어. 모든 권리 보유.
          </p>
          <p className="text-xs text-slate-600 font-mono">
             신뢰와 명확성을 위한 디자인.
          </p>
       </div>
    </footer>
  )
}
