import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, PlusCircle, LayoutList, Image as ImageIcon, BarChart2, Search, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useArticleStore';

export default function AdminLayout() {
  const logout = useAppStore(state => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const navItemClass = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-emerald-600 text-white font-semibold shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Fixed Sticky Sidebar on Desktop */}
      <nav id="admin-sidebar" className="w-full md:w-64 bg-slate-900 text-slate-300 md:sticky md:top-0 md:h-screen md:shrink-0 flex flex-col z-30 shadow-xl border-r border-slate-800">
        
        {/* Top Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">
              Admin Portal
            </h2>
            <span className="text-[10px] uppercase font-mono tracking-widest bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              CMS
            </span>
          </div>
        </div>
        
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5">콘텐츠 관리</div>
            <Link id="nav-articles" to="/admin" className={navItemClass('/admin')}>
              <FileText className="w-4 h-4 shrink-0" /> 기사 관리 (목록)
            </Link>
            <Link id="nav-new-article" to="/admin/article/new" className={navItemClass('/admin/article/new')}>
              <PlusCircle className="w-4 h-4 shrink-0" /> 새 기사 작성
            </Link>
            <Link id="nav-opinions" to="/admin/opinions" className={navItemClass('/admin/opinions')}>
              <FileText className="w-4 h-4 shrink-0" /> 오피니언 관리
            </Link>
            <Link id="nav-categories" to="/admin/categories" className={navItemClass('/admin/categories')}>
              <LayoutList className="w-4 h-4 shrink-0" /> 카테고리 관리
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-1.5">추가 기능</div>
            <Link id="nav-ads" to="/admin/ads" className={navItemClass('/admin/ads')}>
              <ImageIcon className="w-4 h-4 shrink-0" /> 광고 배너 설정
            </Link>
            <Link id="nav-seo" to="/admin/seo" className={navItemClass('/admin/seo')}>
              <Search className="w-4 h-4 shrink-0" /> 검색 최적화(SEO)
            </Link>
            <Link id="nav-company" to="/admin/company-pages" className={navItemClass('/admin/company-pages')}>
              <FileText className="w-4 h-4 shrink-0" /> 회사 정보 관리
            </Link>
            <Link id="nav-inquiries" to="/admin/inquiries" className={navItemClass('/admin/inquiries')}>
              <FileText className="w-4 h-4 shrink-0" /> 광고 문의 관리
            </Link>
            <Link id="nav-analytics" to="/admin/analytics" className={navItemClass('/admin/analytics')}>
              <BarChart2 className="w-4 h-4 shrink-0" /> 방문자 통계
            </Link>
          </div>
        </div>

        {/* Always Visible Sticky Bottom Action Footer (사용자 홈으로 / 로그아웃) */}
        <div id="admin-bottom-actions" className="shrink-0 p-4 border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm flex flex-col gap-1 sticky bottom-0 z-20">
          <Link
            id="nav-user-home"
            to="/"
            className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <Home className="w-4 h-4 text-emerald-400" /> 사용자 홈으로
          </Link>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 text-left px-3 py-2 rounded-lg text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4 text-red-400" /> 로그아웃
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
