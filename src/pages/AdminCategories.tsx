import React, { useState } from 'react';
import { useAppStore, cleanFirestoreData, mergeWithAutoArticles } from '../store/useArticleStore';
import { Trash2, Plus, ArrowUp, ArrowDown, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminCategories() {
  const { categories, addCategory, deleteCategory, updateCategory } = useAppStore();
  const [newCat, setNewCat] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentCats = [...categories];
    currentCats.forEach((c, i) => { if (c.order === undefined) c.order = i; });
    
    const prevCat = currentCats[index - 1];
    const currCat = currentCats[index];
    
    const tempOrder = prevCat.order;
    prevCat.order = currCat.order;
    currCat.order = tempOrder;
    
    updateCategory(prevCat.id, { order: prevCat.order });
    updateCategory(currCat.id, { order: currCat.order });
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const currentCats = [...categories];
    currentCats.forEach((c, i) => { if (c.order === undefined) c.order = i; });
    
    const nextCat = currentCats[index + 1];
    const currCat = currentCats[index];
    
    const tempOrder = nextCat.order;
    nextCat.order = currCat.order;
    currCat.order = tempOrder;
    
    updateCategory(nextCat.id, { order: nextCat.order });
    updateCategory(currCat.id, { order: currCat.order });
  };

  // Publish all current preview categories to Firestore and refresh auto-articles
  const handlePublishCategories = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    try {
      const activeCats = categories.filter(cat => cat.id !== 'cardnews');
      
      for (let i = 0; i < activeCats.length; i++) {
        const cat = activeCats[i];
        const payload = {
          id: cat.id,
          name: cat.name,
          order: cat.order !== undefined ? cat.order : i,
        };
        await setDoc(doc(db, 'categories', cat.id), cleanFirestoreData(payload), { merge: true });
      }

      const currentArticles = useAppStore.getState().articles;
      const remerged = mergeWithAutoArticles(currentArticles, activeCats);
      useAppStore.setState({ categories: activeCats, articles: remerged });

      setPublishMessage(`총 ${activeCats.length}개 카테고리가 실시간 퍼블리싱 및 클라우드 동기화되었습니다.`);
      setTimeout(() => setPublishMessage(null), 4000);
    } catch (error) {
      console.error("카테고리 퍼블리싱 오류:", error);
      setPublishMessage("카테고리 퍼블리싱 중 오류가 발생했습니다.");
    } finally {
      setIsPublishing(false);
    }
  };

  const activeCategories = categories.filter(cat => cat.id !== 'cardnews');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-slate-800">카테고리 관리 및 퍼블리싱</h1>
          <p className="text-sm text-slate-500 mt-1">메인 네비게이션과 글 작성 및 자동 기사 발행에 사용되는 카테고리입니다.</p>
        </div>
        <button
          onClick={handlePublishCategories}
          disabled={isPublishing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 shrink-0"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>퍼블리싱 중...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>카테고리 전체 퍼블리싱</span>
            </>
          )}
        </button>
      </div>

      {publishMessage && (
        <div className="mx-6 mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{publishMessage}</span>
        </div>
      )}

      <div className="p-6">
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>프리뷰 &amp; 라이브 실시간 퍼블리싱 연동</span>
          </div>
          건강검진, 여성건강, 한의학, 척추관절, 오피니언 등 프리뷰에 표시되는 모든 카테고리는 매일 아침 자동 기사 발행 및 메인 화면/카테고리 뷰에 즉시 연동됩니다.
        </div>

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

        <div className="flex flex-col gap-3">
          {activeCategories.map((cat, index) => (
            <div key={cat.id} className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded-md">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center bg-slate-200 rounded text-xs font-bold text-slate-700">
                  {index + 1}
                </span>
                <span className="font-bold text-slate-800">{cat.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                  발행 중
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleMoveUp(index)} 
                  disabled={index === 0}
                  className={`p-2 rounded-md ${index === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
                  title="위로 이동"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleMoveDown(index)} 
                  disabled={index === activeCategories.length - 1}
                  className={`p-2 rounded-md ${index === activeCategories.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
                  title="아래로 이동"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-2"></div>
                <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md" title="삭제">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
