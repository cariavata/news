import React, { useState } from 'react';
import { Article } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Heart, Share2, Link as LinkIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';

interface CardNewsListProps {
  articles: Article[];
  categoryName: string;
}

export default function CardNewsList({ articles, categoryName }: CardNewsListProps) {
  const { toggleArticleLike } = useAppStore();
  
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
    
    // Update local storage state
    const newLikedState = { ...likedArticles, [article.id]: willBeLiked };
    setLikedArticles(newLikedState);
    localStorage.setItem('likedArticles', JSON.stringify(newLikedState));
    
    // Update global store
    toggleArticleLike(article.id, willBeLiked);
    
    // If modal is open, optimistically update the modal's selectedArticle
    if (selectedArticle && selectedArticle.id === article.id) {
      setSelectedArticle({
        ...selectedArticle, 
        likes: Math.max(0, (selectedArticle.likes || 0) + (willBeLiked ? 1 : -1))
      });
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(articles.length / itemsPerPage);

  const currentArticles = articles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const handleShareTwitter = (article: Article) => {
    const url = `${window.location.origin}/article/${article.id}`;
    const text = `[${categoryName}] ${article.title}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleCopyUrl = (article: Article) => {
    const url = `${window.location.origin}/article/${article.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL이 복사되었습니다.');
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {articles.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
          <p className="text-slate-500 font-medium font-sans">등록된 카드뉴스가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {currentArticles.map(article => (
              <div 
                key={article.id} 
                className="group cursor-pointer flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition duration-300 overflow-hidden"
                onClick={() => {
                  setSelectedArticle(article);
                  setModalImageIndex(0);
                }}
              >
                <div className="aspect-square w-full overflow-hidden relative bg-slate-100">
                  {article.cardNewsImages && article.cardNewsImages.length > 0 ? (
                    <img src={article.cardNewsImages[0]} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  )}
                  {article.cardNewsImages && article.cardNewsImages.length > 1 && (
                    <div className="absolute top-3 pl-3 pr-2 py-1 bg-black/60 backdrop-blur-sm right-0 rounded-l-full text-white text-xs font-bold font-mono tracking-widest flex items-center shadow-sm">
                      1 / {article.cardNewsImages.length}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-700 transition">
                    {article.title}
                  </h3>
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs font-bold text-slate-400 font-mono">
                    <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ko })}</span>
                    {article.likes ? (
                      <span className="flex items-center gap-1 text-red-500"><Heart className="w-3 h-3 fill-red-500" /> {article.likes}</span>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 font-mono">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded border font-bold transition ${
                    currentPage === i + 1 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Card News Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[950px] overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side: Image Display */}
            <div className="w-full md:w-[500px] md:h-[500px] lg:w-[550px] lg:h-[550px] relative bg-black shrink-0 flex items-center justify-center aspect-square md:aspect-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                {selectedArticle.cardNewsImages && selectedArticle.cardNewsImages.length > 0 ? (
                  <>
                    <img 
                      src={selectedArticle.cardNewsImages[modalImageIndex]} 
                      alt={`Image ${modalImageIndex + 1}`} 
                      className="w-full h-full object-cover select-none" 
                    />
                    {selectedArticle.cardNewsImages.length > 1 && (
                      <>
                        <button 
                          onClick={() => setModalImageIndex(i => Math.max(0, i - 1))}
                          disabled={modalImageIndex === 0}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md disabled:opacity-0 transition"
                        >
                          <ChevronLeft className="w-5 h-5 -ml-0.5 text-slate-900" />
                        </button>
                        <button 
                          onClick={() => setModalImageIndex(i => Math.min(selectedArticle.cardNewsImages!.length - 1, i + 1))}
                          disabled={modalImageIndex === selectedArticle.cardNewsImages.length - 1}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center shadow-md disabled:opacity-0 transition"
                        >
                          <ChevronRight className="w-5 h-5 ml-0.5 text-slate-900" />
                        </button>
                        
                        {/* Dots (Indicators) */}
                        <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1.5 px-4 z-10 drop-shadow-md">
                          {selectedArticle.cardNewsImages.map((_, i) => (
                            <button
                              key={i}
                              className={`h-1.5 rounded-full transition-all ${i === modalImageIndex ? 'bg-white w-6' : 'bg-white/50 w-1.5 hover:bg-white/70'}`}
                              onClick={() => setModalImageIndex(i)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  selectedArticle.imageUrl ? (
                    <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">이미지 없음</div>
                  )
                )}
              </div>
            </div>

            {/* Right Side: Header, Description and Actions */}
            <div className="w-full md:w-[350px] lg:w-[400px] flex-1 flex flex-col bg-white overflow-hidden max-h-[50vh] md:max-h-none md:h-[500px] lg:h-[550px]">
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-slate-100 shrink-0 relative bg-white gap-3">
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-xs uppercase tracking-widest text-[#00A19D] mb-1">{categoryName || '카드뉴스'}</span>
                  <h2 className="font-serif font-bold text-[15px] sm:text-base leading-snug text-slate-900">{selectedArticle.title}</h2>
                </div>
                <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-slate-900 transition bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 shrink-0 ml-2">
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Description Content */}
              <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1 bg-white hide-scrollbar">
                <p className="text-[13px] sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                  {selectedArticle.content || selectedArticle.excerpt}
                </p>
              </div>
              
              {/* Actions & Footer */}
              <div className="p-4 border-t border-slate-100 shrink-0 flex flex-col gap-2 bg-white">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={(e) => handleToggleLike(e, selectedArticle)}
                    className="flex items-center gap-2 group text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${likedArticles[selectedArticle.id] ? 'fill-red-500 text-red-500' : 'group-hover:fill-red-100'}`} />
                  </button>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => handleShareTwitter(selectedArticle)} className="text-slate-600 hover:text-[#1DA1F2] transition" aria-label="Share on Twitter" title="Share on Twitter">
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button onClick={() => handleCopyUrl(selectedArticle)} className="text-slate-600 hover:text-slate-900 transition" aria-label="Copy URL" title="Copy URL">
                      <LinkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  <span className="font-bold text-[13px] sm:text-sm text-slate-900">좋아요 {selectedArticle.likes || 0}개</span>
                  <span className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest">{formatDistanceToNow(new Date(selectedArticle.createdAt), { addSuffix: true, locale: ko })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
