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
    borderColor: 'border-emerald-700/50',
    badgeBg: 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200',
    badgeText: '건강검진',
    iconColor: 'text-emerald-400',
    icon: ShieldCheck,
    subtext: '정기 종합검진'
  },
  'womens-health': {
    bgGradient: 'from-rose-950 via-slate-900 to-pink-950 text-rose-100',
    borderColor: 'border-rose-700/50',
    badgeBg: 'bg-rose-500/25 border-rose-400/50 text-rose-200',
    badgeText: '여성건강',
    iconColor: 'text-rose-400',
    icon: Heart,
    subtext: '생애주기 헬스케어'
  },
  'spine-joint': {
    bgGradient: 'from-blue-950 via-slate-900 to-indigo-950 text-blue-100',
    borderColor: 'border-blue-700/50',
    badgeBg: 'bg-blue-500/25 border-blue-400/50 text-blue-200',
    badgeText: '척추관절',
    iconColor: 'text-blue-400',
    icon: Activity,
    subtext: '자세 & 관절 재활'
  },
  'oriental-med': {
    bgGradient: 'from-amber-950 via-stone-900 to-yellow-950 text-amber-100',
    borderColor: 'border-amber-700/50',
    badgeBg: 'bg-amber-500/25 border-amber-400/50 text-amber-200',
    badgeText: '한의학',
    iconColor: 'text-amber-400',
    icon: Sparkles,
    subtext: '사상체질 & 전통의학'
  },
  'opinion': {
    bgGradient: 'from-slate-900 via-stone-900 to-zinc-950 text-slate-100',
    borderColor: 'border-slate-700/60',
    badgeBg: 'bg-slate-700/70 border-slate-500 text-slate-100',
    badgeText: '오피니언',
    iconColor: 'text-slate-300',
    icon: Stethoscope,
    subtext: '전문의 칼럼'
  },
  'default': {
    bgGradient: 'from-slate-900 via-slate-800 to-slate-950 text-slate-100',
    borderColor: 'border-slate-700/50',
    badgeBg: 'bg-slate-700/70 border-slate-500 text-slate-100',
    badgeText: '의학 브리핑',
    iconColor: 'text-slate-400',
    icon: Newspaper,
    subtext: '데일리펄스 인사이트'
  }
};

/**
 * Extracts concise, highly readable core medical topic for thumbnail display.
 * Shows only essential subject and clean clinical focus without clutter.
 */
export function extractCoreTopic(article: Article): { primary: string; secondary?: string } {
  const title = (article.title || '').trim();

  // Comprehensive medical topic mapping
  if (/위.*대장|내시경|용종/i.test(title)) {
    return { primary: '위·대장 내시경', secondary: '조기 용종 절제 가이드' };
  }
  if (/간수치|지방간|AST|ALT|감마GTP|r-GTP/i.test(title)) {
    return { primary: '간수치 & 지방간', secondary: 'AST·ALT 간세포 회복' };
  }
  if (/혈당|당화혈색소|HbA1c|당뇨/i.test(title)) {
    return { primary: '공복혈당 & 당뇨', secondary: '당화혈색소 정상화 수칙' };
  }
  if (/경동맥|뇌졸중|플라크|IMT/i.test(title)) {
    return { primary: '경동맥 초음파', secondary: '혈관 플라크 & 뇌졸중 예방' };
  }
  if (/갑상선|K-TIRADS|결절|FNAC/i.test(title)) {
    return { primary: '갑상선 결절', secondary: '초음파 판독 & 세포검사' };
  }
  if (/저선량|간유리|폐결절|폐암/i.test(title)) {
    return { primary: '저선량 흉부 CT', secondary: '폐결절 & 간유리음영' };
  }
  if (/관상동맥|석회화|CACS|심근경색|심장/i.test(title)) {
    return { primary: '관상동맥 석회화', secondary: '심장 CT & 심근경색 예방' };
  }
  if (/신장|eGFR|사구체|단백뇨|신부전|콩팥/i.test(title)) {
    return { primary: '신장 기능 & eGFR', secondary: '단백뇨 & 만성신부전 관리' };
  }
  if (/자궁경부|HPV|가다실|이형성/i.test(title)) {
    return { primary: '자궁경부암 & HPV', secondary: '고위험군 백신 가이드' };
  }
  if (/다낭성|PCOS|난소|인슐린.*저항/i.test(title)) {
    return { primary: '다낭성 난소 증후군', secondary: 'PCOS 호르몬 밸런스' };
  }
  if (/자궁근종|자궁선근증|하이푸|HIFU/i.test(title)) {
    return { primary: '자궁근종 & 선근증', secondary: '비수술 하이푸 보존 치료' };
  }
  if (/자궁내막증|초콜릿낭종|골반통/i.test(title)) {
    return { primary: '자궁내막증', secondary: '골반통 & 유착 방지 관리' };
  }
  if (/완경|폐경|갱년기|HRT|안면홍조/i.test(title)) {
    return { primary: '갱년기 & 완경', secondary: '호르몬 대체요법(HRT)' };
  }
  if (/허리디스크|척추관협착|추간판|좌골신경|신경차단술/i.test(title)) {
    return { primary: '허리디스크 & 협착증', secondary: '비수술 신경차단술 치료' };
  }
  if (/오십견|동결견|유착성.*관절낭|어깨통증/i.test(title)) {
    return { primary: '오십견 (동결견)', secondary: '초음파 수압확장술 재활' };
  }
  if (/목디스크|경추|일자목|거북목|팔.*저림/i.test(title)) {
    return { primary: '경추 목디스크', secondary: 'C자 만곡 회복 도수치료' };
  }
  if (/무릎.*관절염|퇴행성.*관절|콘쥬란|연골/i.test(title)) {
    return { primary: '퇴행성 무릎관절염', secondary: '콘쥬란 PN 연골주사' };
  }
  if (/족저근막|체외충격파|ESWT|발뒤꿈치/i.test(title)) {
    return { primary: '족저근막염', secondary: '체외충격파(ESWT) 재생' };
  }
  if (/담적|소화불량|역류성.*식도|복진/i.test(title)) {
    return { primary: '만성 소화불량 & 담적', secondary: '위장 9구역 복진 & 온열뜸' };
  }
  if (/화병|자율신경|불면증|상열감/i.test(title)) {
    return { primary: '화병 & 자율신경', secondary: '교감신경 이완 한방 처방' };
  }
  if (/비염|축농증|배농|하비갑개/i.test(title)) {
    return { primary: '알레르기 비염', secondary: '비강 점막 배농 & 면역 한약' };
  }
  if (/만성.*피로|부신|공진단|경옥고|보약/i.test(title)) {
    return { primary: '만성피로 & 공진단', secondary: '사상체질 맞춤 보약 처방' };
  }
  if (/추나|골반.*교정|척추.*교정|도수/i.test(title)) {
    return { primary: '척추 추나요법', secondary: '체형 불균형 건강보험 교정' };
  }

  // Fallback using article tags if available
  if (Array.isArray(article.tags) && article.tags.length > 0) {
    const validTags = article.tags.filter(t => t && t.length < 10);
    if (validTags.length >= 2) {
      return { primary: `${validTags[0]} · ${validTags[1]}`, secondary: validTags[2] || undefined };
    } else if (validTags.length === 1) {
      return { primary: validTags[0] };
    }
  }

  // Smart fallback: extract first 2 meaningful nouns
  let cleaned = title
    .replace(/[\[\]\(\)]/g, '')
    .replace(/(최적 주기와|조기|원인과|탈출 솔루션|극복 가이드|예방법|최신 가이드|호르몬 밸런스|감별 진단과|비수술 재활|단계별 맞춤 치료와|정밀 진단과|식이요법|온열 뜸 치료|알아보기|완벽 정리|가이드|솔루션|방법|치료법|로드맵)$/g, '')
    .trim();

  const words = cleaned.split(/[\s,·/:]+/).filter(w => w.length >= 2);
  const primary = words.slice(0, 2).join(' ') || title.slice(0, 10);
  const secondary = words.length > 2 ? words.slice(2, 4).join(' ') : undefined;

  return { primary, secondary };
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

  // Modern, high-performance Korean typographic editorial thumbnail
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

  // Minimal small square thumbnail (e.g., mobile list items without badge)
  if (!showBadge) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} border ${theme.borderColor} flex flex-col items-center justify-center p-2 text-center select-none ${className}`}>
        <div className="flex items-center gap-1 mb-1">
          <IconComponent className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
          <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300 tracking-tight">
            {displayCategory}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-serif font-black text-white leading-tight line-clamp-2 break-keep px-0.5">
          {coreTopic.primary}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${theme.bgGradient} border ${theme.borderColor} flex flex-col justify-between select-none transition-all duration-300 group-hover:border-opacity-100 ${
      isVideo 
        ? 'aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/10] p-3.5 sm:p-4 md:p-3.5 lg:p-4' 
        : 'aspect-square p-5 sm:p-6'
    } ${className}`}>
      
      {/* Decorative subtle background elements */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/[0.04] blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/[0.03] blur-2xl pointer-events-none" />

      {/* Top Bar: Category pill + Medical Icon + Date */}
      <div className="flex items-center justify-between z-10 w-full shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-lg font-extrabold tracking-wider border shadow-sm ${
            isVideo 
              ? 'px-2 py-0.5 text-[10px] sm:text-xs md:text-[10px] lg:text-xs' 
              : 'px-3 py-1.5 text-xs sm:text-sm'
          } ${theme.badgeBg}`}>
            <IconComponent className={isVideo ? 'w-3 h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5' : 'w-4 h-4'} />
            {displayCategory}
          </span>
        </div>
        {dateFormatted && (
          <span className={`font-mono text-slate-300 font-bold tracking-tight ${
            isVideo ? 'text-[10px] sm:text-xs md:text-[10px] lg:text-xs' : 'text-xs sm:text-sm md:text-base'
          }`}>
            {dateFormatted}
          </span>
        )}
      </div>

      {/* Center: Large, Centered & High-Impact Core Topic Display */}
      <div className={`my-auto z-10 flex flex-col items-center justify-center text-center ${
        isVideo 
          ? 'py-1 sm:py-2 md:py-1 lg:py-2 gap-1 sm:gap-1.5 md:gap-1 lg:gap-1.5' 
          : 'py-4 gap-2.5 sm:gap-3'
      }`}>
        <div className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 rounded-full border border-emerald-500/30 ${
          isVideo ? 'text-[9px] sm:text-xs md:text-[9px] lg:text-xs px-2 py-0.5' : 'text-xs sm:text-sm px-2.5 py-0.5'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          <span>핵심 브리핑</span>
        </div>
        <h3 className={`font-serif font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors break-keep drop-shadow-md px-1 ${
          isVideo 
            ? 'text-2xl sm:text-3xl md:text-base lg:text-lg xl:text-xl leading-tight line-clamp-2' 
            : 'text-3xl sm:text-4xl md:text-5xl leading-tight line-clamp-2'
        }`}>
          {coreTopic.primary}
        </h3>
        {coreTopic.secondary && (
          <p className={`font-sans text-slate-200 font-semibold leading-tight break-keep px-1 ${
            isVideo 
              ? 'text-xs sm:text-sm md:text-[11px] lg:text-xs line-clamp-1' 
              : 'text-base sm:text-lg md:text-xl line-clamp-2'
          }`}>
            {coreTopic.secondary}
          </p>
        )}
      </div>

      {/* Bottom Bar: Brand & Subtext */}
      <div className={`flex items-center justify-between border-t border-white/15 z-10 text-slate-300 shrink-0 ${
        isVideo ? 'pt-1 sm:pt-1.5 md:pt-1 lg:pt-1.5 text-[9px] sm:text-xs md:text-[9px] lg:text-[10px]' : 'pt-3 text-xs sm:text-sm'
      }`}>
        <span className="font-sans font-extrabold tracking-wider text-white/90 flex items-center gap-1">
          DAILY PULSE
        </span>
        <span className="font-mono text-slate-300 font-semibold tracking-tight">
          {theme.subtext}
        </span>
      </div>
    </div>
  );
}
