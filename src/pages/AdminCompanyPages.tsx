import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCompanyPages() {
  const { companyPages, deleteCompanyPage } = useAppStore();
  const navigate = useNavigate();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 페이지를 정말 삭제하시겠습니까?')) {
      deleteCompanyPage(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-800">회사 정보 페이지 관리</h1>
          <p className="text-sm text-slate-500 mt-2">하단 푸터에 링크되는 회사 소개, 약관 등의 페이지를 관리합니다.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/company-pages/new')}
          className="bg-slate-900 text-white px-4 py-2 text-sm font-bold rounded flex items-center gap-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" /> 페이지 추가
        </button>
      </div>

      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 font-bold tracking-wider">
                <th className="p-4 py-3 font-normal">제목</th>
                <th className="p-4 py-3 font-normal w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {companyPages.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-slate-500">
                    등록된 페이지가 없습니다.
                  </td>
                </tr>
              ) : (
                companyPages.map(page => (
                  <tr key={page.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{page.title}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/admin/company-pages/edit/${page.id}`)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 transition" 
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(page.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition" 
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
