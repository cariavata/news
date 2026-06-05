import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2, Plus } from 'lucide-react';

export default function AdminCategories() {
  const { categories, addCategory, deleteCategory } = useAppStore();
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCat.trim()) {
      addCategory(newCat.trim());
      setNewCat('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("카테고리를 삭제하시겠습니까? (연결된 기사의 카테고리가 비게 될 수 있습니다)")) {
      deleteCategory(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">카테고리 관리</h1>
        <p className="text-sm text-slate-500 mt-2">메인 네비게이션과 글 작성 시 선택할 수 있는 메뉴입니다.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="flex-1 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="새 카테고리 이름 (예: 건강칼럼)"
          />
          <button type="submit" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-md hover:bg-slate-800 transition flex items-center gap-2 shrink-0">
            <Plus className="w-5 h-5" /> 추가
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-md">
              <span className="font-bold text-slate-800">{cat.name}</span>
              <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
