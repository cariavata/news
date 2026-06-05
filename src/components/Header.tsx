import { Search, Menu, Bell } from 'lucide-react';

export default function Header() {
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());

  return (
    <header className="w-full font-sans">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex gap-4">
          <span>{today}</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition">로그인</a>
          <a href="#" className="hover:text-white transition">구독하기</a>
        </div>
      </div>

      {/* Brand/Logo Area */}
      <div className="bg-white py-6 md:py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center border-b border-slate-100 relative">
        <div className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-4 text-slate-600">
          <button className="hover:text-slate-900" aria-label="Menu"><Menu className="w-6 h-6" /></button>
          <button className="hover:text-slate-900" aria-label="Search"><Search className="w-5 h-5" /></button>
        </div>

        <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-serif font-extrabold text-slate-900 tracking-tight text-center">
          데일리 펄스
        </h1>

        <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center">
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-sm font-semibold rounded-sm transition shadow-sm">
            지금 구독하기
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="bg-white border-b-4 border-slate-900 px-4 sm:px-6 lg:px-8 py-3 relative z-10">
         <ul className="flex justify-center flex-wrap gap-x-8 gap-y-3 text-sm font-bold tracking-widest text-slate-700">
            <li><a href="#" className="hover:text-slate-900 transition">국제</a></li>
            <li><a href="#" className="hover:text-slate-900 transition">정치</a></li>
            <li><a href="#" className="hover:text-slate-900 transition">경제</a></li>
            {/* Health Nav Item - Mint/Sage Accent */}
            <li><a href="#" className="text-emerald-700 hover:text-emerald-800 transition">건강/의학</a></li>
            <li><a href="#" className="hover:text-slate-900 transition">기술</a></li>
            <li><a href="#" className="hover:text-slate-900 transition">과학</a></li>
         </ul>
      </nav>

      {/* Breaking Ticker */}
      <div className="bg-red-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-4 shadow-inner">
        <span className="font-bold text-xs tracking-wider bg-white text-red-700 px-2 py-0.5 rounded-sm shrink-0 flex items-center gap-1">
          <Bell className="w-3 h-3" /> 속보
        </span>
         <p className="text-sm font-medium line-clamp-1 hover:underline cursor-pointer">
           글로벌 헬스케어 연합, 예방 진단 영상 기술의 주요 혁신 발표로 시장 활력 기대...
         </p>
      </div>
    </header>
  )
}
