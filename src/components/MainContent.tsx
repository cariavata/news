import { Clock, User, ArrowRight } from 'lucide-react';

export default function MainContent() {
  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section */}
      <article className="group cursor-pointer">
        <div className="relative overflow-hidden mb-6 bg-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80" 
            alt="City overview" 
            className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-[1.02]" 
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 tracking-wider">
          <span className="text-red-700">주요 기사</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 2시간 전</span>
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> 편집국</span>
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-[1.2] mb-5 group-hover:text-slate-700 transition-colors break-keep">
          글로벌 시장, 역사적인 경제 정상회담 결의안 이후 안정세 회복
        </h1>
        <p className="text-lg text-slate-600 font-sans leading-relaxed md:w-5/6 break-keep">
          며칠간의 치열한 협상 끝에 세계 지도자들은 인플레이션 퇴치와 지속 가능한 기술 인프라 성장을 보장하기 위한 포괄적인 체제에 합의했습니다.
        </p>
      </article>

      {/* Health & Wellness Section - "Fresh & Trustworthy" Theme */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Section Header */}
        <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-6 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
            <h2 className="text-2xl font-serif font-bold text-slate-900">건강 & 웰니스</h2>
            <span className="text-emerald-700 font-sans font-medium hidden sm:inline-block ml-2">— 의학 · 건강검진</span>
          </div>
          <button className="text-xs font-bold font-sans text-emerald-700 hover:text-emerald-800 tracking-widest flex items-center gap-1 group">
            의학 기사 보기 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Card 1: Orthopedics */}
          <article className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full">
            <div className="rounded overflow-hidden mb-5">
              <img src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" alt="Running" />
            </div>
            <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">정형외과</span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
              최소 침습 관절 보존술의 새로운 시대 도래
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-auto break-keep">
              새로운 기술은 스포츠 의학의 한계를 넓혀 회복 시간을 단축하고 최상의 결과를 제공합니다.
            </p>
          </article>

          {/* Card 2: Checkups */}
          <article className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full">
            <div className="rounded overflow-hidden mb-5">
              <img src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&q=80" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" alt="Doctor" />
            </div>
            <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">건강검진</span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
              매년 받는 건강검진이 그 어느 때보다 중요한 이유
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-auto break-keep">
              조기 진단 검사는 장기적인 예방 치료 성공과 건강 수명 연장의 가장 중요한 요소로 입증되고 있습니다.
            </p>
          </article>

          {/* Card 3: Women's Health */}
          <article className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full">
            <div className="rounded overflow-hidden mb-5">
              <img src="https://images.unsplash.com/photo-1550831107-1553da8c8464?w=600&q=80" className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" alt="Healthy Lifestyle" />
            </div>
            <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">산부인과</span>
            <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
              생애 주기별 맞춤 여성 건강 및 웰니스 패러다임
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-auto break-keep">
              역동적인 의료 및 라이프스타일 변화에 따른 웰니스와 활력 관리에 대한 포괄적인 가이드를 제공합니다.
            </p>
          </article>

        </div>
      </section>
    </div>
  )
}
