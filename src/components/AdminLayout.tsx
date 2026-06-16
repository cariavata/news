import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Home, FileText, PlusCircle, LayoutList, Image as ImageIcon, BarChart2, Search, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';

export default function AdminLayout() {
  const logout = useAppStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col space-y-6">
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
          Admin Portal
        </h2>
        
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">콘텐츠 관리</div>
          <Link to="/admin" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <FileText className="w-5 h-5" /> 기사 관리 (목록)
          </Link>
          <Link to="/admin/article/new" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <PlusCircle className="w-5 h-5" /> 새 기사 작성
          </Link>
          <Link to="/admin/opinions" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <FileText className="w-5 h-5" /> 오피니언 관리
          </Link>
          <Link to="/admin/categories" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <LayoutList className="w-5 h-5" /> 카테고리 관리
          </Link>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">추가 기능</div>
          <Link to="/admin/ads" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <ImageIcon className="w-5 h-5" /> 광고 배너 설정
          </Link>
          <Link to="/admin/seo" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <Search className="w-5 h-5" /> 검색 최적화(SEO)
          </Link>
          <Link to="/admin/company-pages" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <FileText className="w-5 h-5" /> 회사 정보 관리
          </Link>
          <Link to="/admin/inquiries" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <FileText className="w-5 h-5" /> 광고 문의 관리
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <BarChart2 className="w-5 h-5" /> 방문자 통계
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-10">
          <Link to="/" className="flex items-center gap-3 hover:text-white hover:bg-slate-800 px-2 py-2 rounded-md transition">
            <Home className="w-5 h-5" /> 사용자 홈으로
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 hover:text-red-400 text-left px-2 py-2 rounded-md transition">
            <LogOut className="w-5 h-5" /> 로그아웃
          </button>
        </div>
      </nav>
      <main className="flex-1 p-6 md:p-10 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
