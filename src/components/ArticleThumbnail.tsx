import React from 'react';
import { Article } from '../types';
import { Activity, ShieldCheck, Heart, Sparkles, Stethoscope, Newspaper } from 'lucide-react';

interface ArticleThumbnailProps {
  article: Article;
  categoryName?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  showBadge?: boolean;
}

const CATEGORY_THEMES: Record<string, {
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  subtext: string;
}> = {
  'checkup': {
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950 text-emerald-100',
    borderColor: 'border-emerald-800/40',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    badgeText: '건강검진',
    iconColor: 'text-emerald-400',
    icon: ShieldCheck,
    subtext: '정기 종합검진 가이드'
  },
  'womens-health': {
    bgGradient: 'from-rose-950 via-slate-900 to-pink-950 text-rose-100',
    borderColor: 'border-rose-800/40',
    badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    badgeText: '여성건강',
    iconColor: 'text-rose-400',
    icon: Heart,
    subtext: '생애주기 헬스케어'
  },
  'spine-joint': {
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950 text-blue-100',
    borderColor: 'border-blue-800/40',
    badgeBg: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
    badgeText: '척추관절',
    iconColor: 'text-blue-400',
    icon: Activity,
    subtext: '바른 자세 & 관절 재활'
  },
  'oriental-med': {
    bgGradient: 'from-amber-950 via-stone-900 to-yellow-950 text-amber-100',
    borderColor: 'border-amber-800/40',
    badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    badgeText: '한의학',
    iconColor: 'text-amber-400',
    icon: Sparkles,
    subtext: '사상체질 & 전통의학'
  },
  'opinion': {
    bgGradient: 'from-slate-900 via-stone-900 to-zinc-950 text-slate-100',
    borderColor: 'border-slate-700/50',
    badgeBg: 'bg-slate-700/50 border-slate-600 text-slate-200',
    badgeText: '오피니언',
    iconColor: 'text-slate-300',
    icon: Stethoscope,
    subtext: '전문의 칼럼'
  },
  'default': {
    bgGradient: 'from-slate-900 via-slate-800 to-slate-950 text-slate-100',
    borderColor: 'border-slate-700/40',
    badgeBg: 'bg-slate-700/40 border-slate-600 text-slate-300',
    badgeText: '의학 브리핑',
    iconColor: 'text-slate-400',
    icon: Newspaper,
    subtext: '데일리펄스 헬스 인사이트'
  }
};

// Extract concise core medical topic from article title or tags
export function extractCoreTopic(article: Article): { primary: string; secondary?: string } {
  const title = (article.title || '').trim();

  // Match known major medical topics
  if (/위.*대장|내시경|용종/i.test(title)) {
    return { primary: '위·대장 내시경', secondary: '조기 용종 절제 가이드' };
  }
  if (/간수치|지방간|AST|ALT|감마GTP/i.test(title)) {
    return { primary: '간수치 & 지방간', secondary: 'AST·ALT 간세포 회복' };
  }
  if (/혈당|당화혈색소|당뇨/i.test(title)) {
    return { primary: '공복혈당 & 당뇨', secondary: '당뇨 전단계 극복 솔루션' };
  }
  if (/경동맥|뇌졸중|플라크|혈관/i.test(title)) {
    return { primary: '경동맥 초음파', secondary: '혈관 플라크 & 뇌졸중 예방' };
  }
  if (/자궁경부|HPV|가다실/i.test(title)) {
    return { primary: '자궁경부암 & HPV', secondary: '고위험군 백신 가이드' };
  }
  if (/다낭성|PCOS|난소|생리불순/i.test(title)) {
    return { primary: '다낭성 난소 증후군', secondary: 'PCOS 호르몬 밸런스' };
  }
  if (/허리디스크|척추관협착|추간판|좌골신경/i.test(title)) {
    return { primary: '허리디스크 & 협착증', secondary: '비수술 신경재활 치료' };
  }
  if (/무릎|관절염|콘쥬란|연골/i.test(title)) {
    return { primary: '무릎 퇴행성 관절염', secondary: '연골 보호 주사 치료' };
  }
  if (/사상체질|공진단|경옥고|보약/i.test(title)) {
    return { primary: '사상체질 & 맞춤보약', secondary: '태양·소양·태음·소음' };
  }
  if (/담적|소화불량|역류성/i.test(title)) {
    return { primary: '만성 소화불량 & 담적', secondary: '위장 복진 & 온열 치료' };
  }

  // Fallback using article tags if available
  if (Array.isArray(article.tags) && article.tags.length > 0) {
    const validTags = article.tags.filter(t => t && t.length < 12);
    if (validTags.length >= 2) {
      return { primary: `${validTags[0]} · ${validTags[1]}`, secondary: validTags[2] || undefined };
    } else if (validTags.length === 1) {
      return { primary: validTags[0] };
    }
  }

  // Generic fallback: clean title of noise suffixes
  let cleaned = title
    .replace(/^\[.*?\]\s*/, '')
    .replace(/(최적 주기와|조기|원인과|탈출 솔루션|극복 가이드|예방법|최신 가이드|호르몬 밸런스|감별 진단과|비수술 재활|단계별 맞춤 치료와|정밀 진단과|식이요법|온열 뜸 치료|알아보기|완벽 정리|가이드|솔루션|방법)$/g, '')
    .trim();

  if (cleaned.length > 14) {
    const parts = cleaned.split(/[\s,·/:]+/);
    cleaned = parts.slice(0, 2).join(' ');
  }

  return { primary: cleaned || title.slice(0, 14) };
}

export default function ArticleThumbnail({
  article,
  categoryName,
  className = '',
  aspectRatio = 'square',
  showBadge = true
}: ArticleThumbnailProps) {
  const [imgError, setImgError] = React.useState(false);

  // If valid image exists and hasn't errored, display the image
  if (article.imageUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${aspectRatio === 'square' ? 'aspect-square' : aspectRatio === 'video' ? 'aspect-video sm:aspect-[16/10]' : ''} ${className}`}>
        <img
          src={article.imageUrl}
          alt={article.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {showBadge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-slate-900/80 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 tracking-wider backdrop-blur-sm rounded">
              {categoryName || '뉴스'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Modern, high-performance Korean typographic editorial thumbnail (0 bytes storage in DB)
  const catKey = article.categoryId || (article as any).category || 'default';
  const theme = CATEGORY_THEMES[catKey] || CATEGORY_THEMES['default'];
  const IconComponent = theme.icon;

  const displayCategory = categoryName || theme.badgeText;
  const coreTopic = extractCoreTopic(article);
  const isVideo = aspectRatio === 'video';
  
  // Format date display (e.g. 2026.08.31)
  const dateFormatted = article.createdAt 
    ? article.createdAt.slice(0, 10).replace(/-/g, '.')
    : '';

  // Minimal tiny square thumbnail (e.g., mobile list items without badge)
  if (!showBadge) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} border ${theme.borderColor} flex flex-col items-center justify-center p-2 text-center select-none ${className}`}>
        <IconComponent className="w-4 h-4 text-emerald-400 mb-1 shrink-0" />
        <span className="text-[11px] font-serif font-bold text-white leading-tight line-clamp-2 break-keep">
          {coreTopic.primary}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} border ${theme.borderColor} flex flex-col justify-between select-none transition-all duration-300 group-hover:border-opacity-100 ${
      isVideo 
        ? 'aspect-video sm:aspect-[16/10] p-3 sm:p-4' 
        : 'aspect-square p-4 sm:p-5'
    } ${className}`}>
      
      {/* Decorative subtle background elements */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/[0.02] blur-2xl pointer-events-none" />

      {/* Top Bar: Category pill + Medical Icon + Date */}
      <div className="flex items-center justify-between z-10 w-full shrink-0">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full font-bold tracking-wider border ${
            isVideo 
              ? 'px-2 py-0.5 text-[10px]' 
              : 'px-2.5 py-1 text-[11px]'
          } ${theme.badgeBg}`}>
            <IconComponent className={isVideo ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            {displayCategory}
          </span>
        </div>
        {dateFormatted && (
          <span className={`font-mono text-slate-400 font-medium tracking-tight ${
            isVideo ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
          }`}>
            {dateFormatted}
          </span>
        )}
      </div>

      {/* Center: Clean & Prominent Core Topic Display */}
      <div className={`my-auto z-10 flex flex-col justify-center ${isVideo ? 'py-1 gap-1' : 'py-2 gap-1.5'}`}>
        <div className={`flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider text-slate-400/90 ${
          isVideo ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-[11px]'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>핵심 브리핑</span>
        </div>
        <h3 className={`font-serif font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors break-keep ${
          isVideo 
            ? 'text-[15px] sm:text-[17px] md:text-lg leading-snug line-clamp-1' 
            : 'text-lg sm:text-xl md:text-2xl leading-tight'
        }`}>
          {coreTopic.primary}
        </h3>
        {coreTopic.secondary && (
          <p className={`font-sans text-slate-300/90 font-medium leading-normal break-keep line-clamp-1 ${
            isVideo ? 'text-[10px] sm:text-[11px]' : 'text-xs sm:text-sm'
          }`}>
            {coreTopic.secondary}
          </p>
        )}
      </div>

      {/* Bottom Bar: Brand & Subtext */}
      <div className={`flex items-center justify-between border-t border-white/10 z-10 text-slate-400 shrink-0 ${
        isVideo ? 'pt-1.5 text-[9px] sm:text-[10px]' : 'pt-2.5 text-[10px] sm:text-[11px]'
      }`}>
        <span className="font-sans font-semibold tracking-wider text-slate-300 flex items-center gap-1">
          DAILY PULSE
        </span>
        <span className="font-mono text-slate-400 text-[9px] sm:text-[10px] tracking-tight">
          {theme.subtext}
        </span>
      </div>
    </div>
  );
}
