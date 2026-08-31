import { Clock, User, ArrowRight, X, ChevronLeft, ChevronRight, Heart, Share2, Link as LinkIcon } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import OpinionSection from './OpinionSection';
import ArticleThumbnail from './ArticleThumbnail';
import { useState, useEffect } from 'react';
import { Article } from '../types';
import { renderContentWithLinks } from '../lib/renderLinks';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

export default function MainContent() {
  const { articles, categories, toggleArticleLike, hasFetchedInitialArticles } = useAppStore();
  
  // Always sort articles by date descending (newest first)
  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Top 4 most recent articles for the hero grid (ensures latest articles show up at the top)
  const featuredArticles = sortedArticles.slice(0, 4);

  const navigate = useNavigate();
  
  const [selectedCardNews, setSelectedCardNews] = useState<Article | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('likedArticles');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleToggleLike = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    const isCurrentlyLiked = !!likedArticles[article.id];
    const willBeLiked = !isCurrentlyLiked;
    
    const newLikedState = { ...likedArticles, [article.id]: willBeLiked };
    setLikedArticles(newLikedState);
    localStorage.setItem('likedArticles', JSON.stringify(newLikedState));
    
    toggleArticleLike(article.id, willBeLiked);
    
    if (selectedCardNews && selectedCardNews.id === article.id) {
      setSelectedCardNews({
        ...selectedCardNews, 
        likes: Math.max(0, (selectedCardNews.likes || 0) + (willBeLiked ? 1 : -1))
      });
    }
  };

  const handleCopyUrl = (article: Article) => {
    const url = `${window.location.origin}/article/${article.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL이 복사되었습니다.');
    });
  };

  const handleTwitterShare = (article: Article) => {
    const url = `${window.location.origin}/article/${article.id}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  // Disable body scroll when modal is open
  useEffect(() => {
    if (selectedCardNews) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCardNews]);

  const images = selectedCardNews?.cardNewsImages && selectedCardNews.cardNewsImages.length > 0
    ? selectedCardNews.cardNewsImages
    : (selectedCardNews?.imageUrl ? [selectedCardNews.imageUrl] : []);

  if (!hasFetchedInitialArticles && articles.length === 0) {
    return (
      <div className="flex flex-col gap-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="bg-slate-200 rounded-lg aspect-square w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-7 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {/* Hero Section (Featured Articles) */}
      {featuredArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {featuredArticles.map(article => (
            <Link to={`/article/${article.id}`} key={article.id} className="group cursor-pointer flex flex-col">
              <ArticleThumbnail 
                article={article} 
                categoryName={getCategoryName(article.categoryId)} 
                aspectRatio="square" 
                className="rounded-xl mb-4" 
              />
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-3 tracking-wider">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 leading-[1.3] mb-3 group-hover:text-emerald-700 transition-colors break-keep line-clamp-2">
                {article.title}
              </h2>
              <p className="text-[15px] text-slate-600 font-sans leading-relaxed break-keep line-clamp-2">
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Sections by Category */}
      {categories.map(category => {
        if (category.id === 'opinion') {
          return <OpinionSection key={category.id} />;
        }

        const categoryArticles = articles
          .filter(a => (a.categoryId === category.id || (a as any).category === category.id))
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        if (categoryArticles.length === 0) return null;

        if (category.id === 'cardnews') {
          return (
            <section key={category.id} className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative border border-slate-800">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -rotate-45 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl rotate-45 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
              
              <div className="p-6 sm:px-8 pt-8 flex items-end justify-between relative z-10 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <h2 className="text-3xl font-serif font-extrabold text-white tracking-tight flex items-center gap-3">
                    <span className="text-blue-400">#</span>
                    {category.name}
                  </h2>
                  <p className="text-slate-400 text-sm mt-2 font-medium">핫한 이슈를 한눈에 보는 카드뉴스</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex gap-1.5 items-center mr-4">
                    <button 
                      onClick={() => {
                        const container = document.getElementById('cardnews-scroll-container');
                        if (container) container.scrollBy({ left: -300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition"
                      aria-label="이전 카드뉴스"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button 
                      onClick={() => {
                        const container = document.getElementById('cardnews-scroll-container');
                        if (container) container.scrollBy({ left: 300, behavior: 'smooth' });
                      }}
                      className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition"
                      aria-label="다음 카드뉴스"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                  <Link to={`/category/${category.id}`} className="text-xs font-bold font-sans text-blue-400 hover:text-blue-300 tracking-widest flex items-center gap-1 group bg-blue-500/10 hover:bg-blue-500/20 px-3 py-2 rounded-full transition-all">
                    전체 보기 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div id="cardnews-scroll-container" className="flex overflow-x-auto gap-4 px-6 sm:px-8 pb-8 snap-x snap-mandatory hide-scrollbar relative z-10 scroll-smooth">
                {categoryArticles.slice(0, 5).map((article, idx) => (
                  <div 
                    key={article.id} 
                    className="snap-start shrink-0 w-[240px] sm:w-[280px] group cursor-pointer flex flex-col relative block"
                    onClick={() => {
                      setSelectedCardNews(article);
                      setCurrentCardIndex(0);
                    }}
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden relative shadow-lg bg-slate-800">
                      {article.cardNewsImages && article.cardNewsImages.length > 0 ? (
                        <img src={article.cardNewsImages[0]} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Pagination Pill */}
                      {article.cardNewsImages && article.cardNewsImages.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-white text-[10px] font-bold font-mono tracking-widest shadow-sm">
                          {article.cardNewsImages.length}장
                        </div>
                      )}
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-serif font-bold text-lg leading-snug line-clamp-2 drop-shadow-md group-hover:text-blue-200 transition-colors">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        const isListCategory = ['checkup', 'womens-health', 'spine-joint', 'oriental-med'].includes(category.id);

        return (
          <section key={category.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Section Header */}
            <div className="bg-emerald-50/50 border-b border-emerald-100/50 p-5 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 sm:h-8 bg-emerald-600 rounded-full" />
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">{category.name}</h2>
              </div>
              <Link to={`/category/${category.id}`} className="text-[11px] sm:text-xs font-bold font-sans text-emerald-700 hover:text-emerald-800 tracking-widest flex items-center gap-1 group">
                기사 전체 보기 
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Desktop Grid and Default Mobile Layout */}
            <div className={`grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 ${isListCategory ? 'hidden md:grid' : ''}`}>
              {categoryArticles.slice(0, 3).map(article => (
                <Link to={`/article/${article.id}`} key={article.id} className="p-6 sm:p-8 hover:bg-slate-50/50 transition-colors group cursor-pointer flex flex-col h-full block">
                  <ArticleThumbnail 
                    article={article} 
                    categoryName={category.name} 
                    aspectRatio="video" 
                    className="rounded-lg mb-5 shrink-0" 
                  />
                  <span className="text-emerald-600 text-[11px] font-bold tracking-widest mb-3 block">
                    {category.name}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug break-keep">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-auto break-keep pt-3 line-clamp-3">
                    {article.excerpt}
                  </p>
                </Link>
              ))}
            </div>

            {/* Mobile List Layout for Specific Categories */}
            {isListCategory && (
              <div className="flex flex-col md:hidden divide-y divide-slate-100">
                {categoryArticles.slice(0, 4).map(article => (
                  <Link to={`/article/${article.id}`} key={article.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex-1 min-w-0 flex flex-col pt-1">
                      <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug break-keep line-clamp-2 mb-2">
                        {article.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono mt-auto">
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <ArticleThumbnail 
                      article={article} 
                      categoryName={category.name} 
                      aspectRatio="square" 
                      showBadge={false} 
                      className="w-[84px] h-[84px] shrink-0 rounded-lg p-2 text-[10px]" 
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Card News Popup Modal */}
      {selectedCardNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[950px] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side: Image Display */}
            <div className="w-full md:w-[500px] md:h-[500px] lg:w-[550px] lg:h-[550px] relative bg-black shrink-0 flex items-center justify-center aspect-square md:aspect-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                {images.length > 0 ? (
                  <>
                    <img 
                      src={images[currentCardIndex]} 
                      alt={`Image ${currentCardIndex + 1}`} 
                      className="w-full h-full object-cover select-none" 
                    />
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={() => setCurrentCardIndex(i => Math.max(0, i - 1))}
                          disabled={currentCardIndex === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md disabled:opacity-0 transition"
                        >
                          <ChevronLeft className="w-5 h-5 -ml-0.5 text-slate-900" />
                        </button>
                        <button 
                          onClick={() => setCurrentCardIndex(i => Math.min(images.length - 1, i + 1))}
                          disabled={currentCardIndex === images.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md disabled:opacity-0 transition"
                        >
                          <ChevronRight className="w-5 h-5 ml-0.5 text-slate-900" />
                        </button>
                        
                        {/* Dots (Indicators) */}
                        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 px-4 z-10 drop-shadow-md">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              className={`h-1.5 rounded-full transition-all ${i === currentCardIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5 hover:bg-white/70'}`}
                              onClick={() => setCurrentCardIndex(i)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">이미지 없음</div>
                )}
              </div>
            </div>

            {/* Right Side: Header, Description and Actions */}
            <div className="w-full md:w-[350px] lg:w-[400px] flex-1 flex flex-col bg-white overflow-hidden max-h-[50vh] md:max-h-none md:h-[500px] lg:h-[550px]">
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-slate-100 shrink-0 relative bg-white gap-3">
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-xs uppercase tracking-widest text-[#00A19D] mb-1">{getCategoryName(selectedCardNews.categoryId || '') || '카드뉴스'}</span>
                  <h2 className="font-serif font-bold text-[15px] sm:text-base leading-snug text-slate-900">{selectedCardNews.title}</h2>
                </div>
                <button onClick={() => setSelectedCardNews(null)} className="text-slate-400 hover:text-slate-900 transition bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 shrink-0 ml-2">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Description Content */}
              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 bg-white hide-scrollbar">
                <div className="text-[13px] sm:text-sm text-slate-700 leading-relaxed break-words">
                  {renderContentWithLinks(selectedCardNews.content || selectedCardNews.excerpt)}
                </div>
                
                <button
                  onClick={() => {
                    setSelectedCardNews(null);
                    navigate(`/article/${selectedCardNews.id}`);
                  }}
                  className="font-bold font-sans text-blue-600 hover:text-blue-500 tracking-widest flex items-center gap-1 group mt-2"
                >
                  기사 원문 보기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              {/* Actions & Footer */}
              <div className="p-4 border-t border-slate-100 shrink-0 flex flex-col gap-2 bg-white">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={(e) => handleToggleLike(e, selectedCardNews)}
                    className="flex items-center gap-2 group text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${likedArticles[selectedCardNews.id] ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-100'}`} />
                  </button>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button 
                      onClick={() => handleTwitterShare(selectedCardNews)} 
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-full transition shadow-sm" 
                      aria-label="X (Twitter) 공유" 
                      title="X (트위터) 공유"
                    >
                      <XIcon />
                    </button>
                    <button 
                      onClick={() => handleCopyUrl(selectedCardNews)} 
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition shadow-sm border border-slate-200" 
                      aria-label="URL 복사" 
                      title="URL 복사"
                    >
                      <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="font-bold text-[13px] sm:text-sm text-slate-900">좋아요 {selectedCardNews.likes || 0}개</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">{formatDistanceToNow(new Date(selectedCardNews.createdAt), { addSuffix: true, locale: ko })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
