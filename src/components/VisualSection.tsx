import React from 'react';
import { useAppStore } from '../store/useArticleStore';

export default function VisualSection() {
  const { seoSettings, isFirebaseSettingsLoaded } = useAppStore();
  
  const isEnabled = seoSettings.homeIntroEnabled !== false;
  const introText = seoSettings.homeIntroText || '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.';

  // Maintain height and background but hide text to prevent FOUC
  if (!isEnabled) {
    return null;
  }

  return (
    <div className={`relative w-full overflow-hidden bg-[#020813] border-b border-blue-900/30 transition-opacity duration-500 ${isFirebaseSettingsLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Deep luxurious dynamic background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020813] to-[#020813] bg-gradient-x">
        
        {/* Abstract glowing orbs representing the 'Daily' premium colors */}
        <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-blue-600/30 rounded-full blur-[120px] animate-float mix-blend-screen" />
        <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-cyan-500/15 rounded-full blur-[100px] animate-float-delayed mix-blend-screen" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-700/20 rounded-full blur-[130px] animate-float mix-blend-screen" />
        
        {/* Dynamic Geometric Grid with perspective & animation */}
        <div className="absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.15)_1px,transparent_1px)] bg-[size:60px_60px] origin-top animate-grid-flow" style={{ transform: 'perspective(1000px) rotateX(60deg) scale(2.5) translateY(-20%)' }} />
        </div>

        {/* Dynamic Moving Geometric Light Beams */}
        <div className="absolute inset-0 overflow-hidden mix-blend-screen opacity-70 z-0">
          <div className="absolute w-[200vw] h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-line-d1 blur-[1px]" style={{ top: '-10%', left: '-50%' }} />
          <div className="absolute w-[200vw] h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-line-d2 blur-[2px]" style={{ top: '-30%', right: '-50%', animationDelay: '3s' }} />
          <div className="absolute w-[200vw] h-[1px] bg-gradient-to-r from-transparent via-indigo-300 to-transparent animate-line-d1 opacity-80" style={{ top: '20%', left: '-50%', animationDelay: '7s' }} />
          
          {/* Vertical slow rotating beams */}
          <div className="absolute w-[2px] h-[300vh] bg-gradient-to-b from-transparent via-blue-500 to-transparent left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-40 blur-[1px]" />
          <div className="absolute w-[1px] h-[300vh] bg-gradient-to-b from-transparent via-cyan-300 to-transparent left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-30 style" style={{ animationDirection: 'reverse' }} />
        </div>
      </div>

      {/* Decorative luxury borders */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-36 text-center flex flex-col items-center justify-center min-h-[350px]">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-serif font-extrabold tracking-tight leading-[1.3] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-2xl break-keep">
          {introText}
        </h2>
        {/* Luxury accent line under text */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="w-16 sm:w-24 h-[2px] bg-gradient-to-r from-transparent to-blue-500 opacity-70" />
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-45 border border-cyan-400 bg-blue-500/20 shadow-[0_0_12px_rgba(34,211,238,0.6)]" />
          <div className="w-16 sm:w-24 h-[2px] bg-gradient-to-l from-transparent to-blue-500 opacity-70" />
        </div>
      </div>
    </div>
  );
}
