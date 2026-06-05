import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';

export default function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, addArticle, updateArticle, categories } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: categories[0]?.id || '',
    imageUrl: '',
    author: '편집국',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
  });

  useEffect(() => {
    if (id) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setFormData({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          categoryId: article.categoryId,
          imageUrl: article.imageUrl,
          author: article.author,
          isFeatured: article.isFeatured,
          isTrending: article.isTrending,
          isBreaking: article.isBreaking,
        });
      }
    } else if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [id, articles, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateArticle(id, formData);
    } else {
      addArticle({ ...formData });
    }
    navigate('/admin');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h1 className="text-xl font-bold font-sans text-slate-800">
          {id ? '기사 수정' : '새 기사 작성'}
        </h1>
        <Link to="/admin" className="text-slate-500 hover:text-slate-800 font-medium text-sm">
          취소 / 뒤로가기
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">제목</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
              placeholder="기사 제목을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">카테고리</label>
            <select 
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">작성자</label>
            <input 
              required
              type="text" 
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">요약문 (Excerpt)</label>
            <textarea 
              rows={2}
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition resize-none"
              placeholder="메인 페이지에 표시될 요약 내용을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">대표 이미지 첨부</label>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input 
                type="url" 
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition flex-1 w-full"
                placeholder="또는 이미지 URL을 입력하세요 (https://...)"
              />
              <span className="text-slate-400 font-bold shrink-0">OR</span>
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300">
                <span>내 컴퓨터에서 사진 추가</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="preview" className="mt-2 h-32 w-auto object-cover rounded-md border border-slate-200" />
            )}
          </div>

          <div className="flex flex-col gap-4 md:col-span-2 bg-slate-50 p-4 border border-slate-200 rounded-md mt-2">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">홈페이지 노출 설정 (위치 배정)</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-5 h-5 text-slate-900 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">주요 기사 (가장 큰 배너)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                  className="w-5 h-5 text-slate-900 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">실시간 많이 본 뉴스 (사이드바)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData({...formData, isBreaking: e.target.checked})}
                  className="w-5 h-5 text-red-600 rounded border-red-300"
                />
                <span className="text-sm font-medium text-red-700">상단 속보 티커</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">※ '건강/의학' 카테고리 글은 하단 건강 & 웰니스 섹션에 자동으로 배정됩니다. 여러 개를 체크할 경우 여러 위치에 동시에 표출될 수 있습니다.</p>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">본문 내용</label>
            <textarea 
              rows={10}
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition resize-y"
              placeholder="전체 기사 내용을 입력하세요"
            />
          </div>

        </div>
        
        <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-200">
           <Link to="/admin" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition">
             취소
           </Link>
           <button type="submit" className="px-8 py-3 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 transition shadow-sm">
             {id ? '수정 완료' : '기사 등록'}
           </button>
        </div>
      </form>
    </div>
  );
}
