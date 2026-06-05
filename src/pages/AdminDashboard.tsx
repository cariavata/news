import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { articles, deleteArticle, categories } = useAppStore();

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  const handleDelete = (id: string) => {
    if (window.confirm("정말 이 기사를 삭제하시겠습니까?")) {
      deleteArticle(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">기사 목록</h1>
        <Link to="/admin/article/new" className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-slate-800 transition">
          새 기사 작성
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-sm font-bold uppercase tracking-wider">
              <th className="p-4 border-b border-slate-200">제목</th>
              <th className="p-4 border-b border-slate-200">카테고리</th>
              <th className="p-4 border-b border-slate-200 text-center">노출 위치</th>
              <th className="p-4 border-b border-slate-200">작성일</th>
              <th className="p-4 border-b border-slate-200 text-right">관리</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="p-4 font-medium text-slate-900 max-w-xs truncate" title={article.title}>
                  {article.title}
                </td>
                <td className="p-4 text-slate-600">
                  {getCategoryName(article.categoryId)}
                </td>
                <td className="p-4 ">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {article.isFeatured && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">주요 기사</span>}
                    {article.isTrending && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">인기(사이드)</span>}
                    {article.isBreaking && <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">속보</span>}
                  </div>
                </td>
                <td className="p-4 text-slate-500 font-mono text-xs">
                  {format(new Date(article.createdAt), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="p-4 text-right flex gap-3 justify-end items-center">
                  <Link to={`/admin/article/${article.id}`} className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                    <Edit className="w-4 h-4" /> 수정
                  </Link>
                  <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  등록된 기사가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
