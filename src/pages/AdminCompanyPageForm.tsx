import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { useNavigate, useParams } from 'react-router-dom';
import { CompanyPage } from '../types';

export default function AdminCompanyPageForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companyPages, addCompanyPage, updateCompanyPage } = useAppStore();
  
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState<Omit<CompanyPage, 'id'>>({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (isEditing) {
      const page = companyPages.find(p => p.id === id);
      if (page) {
        setFormData({ title: page.title, content: page.content });
      }
    }
  }, [id, companyPages, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('모두 입력해주세요.');
      return;
    }
    
    if (isEditing && id) {
      updateCompanyPage(id, formData);
    } else {
      addCompanyPage(formData);
    }
    
    navigate('/admin/company-pages');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">
          {isEditing ? '회사 정보 페이지 수정' : '새 회사 정보 페이지 작성'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-700">제목</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
            placeholder="페이지 제목 (예: 회사 소개)"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-700">본문 내용 (마크다운 지원)</label>
          <textarea 
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            className="border border-slate-300 rounded-md p-3 min-h-[400px] focus:ring-2 focus:ring-slate-900 outline-none transition font-sans text-sm leading-relaxed whitespace-pre-wrap leading-relaxed"
            placeholder="내용을 입력하세요..."
            required
          />
        </div>

        <div className="mt-4 pt-6 border-t border-slate-200 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/company-pages')}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition"
          >
            취소
          </button>
          <button type="submit" className="bg-slate-900 text-white font-bold px-8 py-3 rounded-md hover:bg-slate-800 transition">
            {isEditing ? '수정 완료' : '추가하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
