import React, { useState } from 'react';
import { Menu, Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';

export default function Header() {
  const { articles, categories, seoSettings, isAuthenticated } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const breakingNews = articles.filter(a => a.isBreaking).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const today = new Intl.DateTimeFormat('ko-KR', dateOptions).format(new Date());

  return (
    <header className="w-full font-sans">
      {/* Top Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 flex justify-between items-center border-b border-slate-800">
        <div className="flex gap-4">
          <span>{today}</span>
        </div>
      </div>

      {/* Brand/Logo Area */}
      <div className="bg-white py-6 md:py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center border-b border-slate-100 relative">
        <div className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 flex items-center gap-4 text-slate-600">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:text-slate-900 transition" aria-label="Menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <Link to="/">
          {seoSettings?.logoUrl ? (
            <img src={seoSettings.logoUrl} alt={seoSettings.siteName || 'Logo'} className="w-[180px] sm:w-[240px] md:w-[320px] lg:w-[400px] h-auto object-contain mx-auto" />
          ) : (
            <h1 className="text-[2.5rem] md:text-6xl lg:text-7xl font-serif font-extrabold text-slate-900 tracking-tight text-center">
              {seoSettings?.siteName || 'DAILY PULSE'}
            </h1>
          )}
        </Link>
      </div>

      {/* Main Nav (Desktop) & Mobile Draw Menu */}
      <nav className={`bg-white border-b-4 border-slate-900 px-4 sm:px-6 lg:px-8 py-4 relative z-10 transition-all ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
         <ul className={`flex ${isMenuOpen ? 'flex-col gap-6 py-4' : 'justify-center flex-wrap gap-x-10 gap-y-3'} text-base md:text-lg font-bold tracking-widest text-slate-700`}>
            {categories.map(cat => (
              <li key={cat.id}>
                <Link to={`/category/${cat.id}`} className="hover:text-slate-900 transition block text-center md:inline">
                  {cat.name}
                </Link>
              </li>
            ))}
         </ul>
      </nav>

      {/* Breaking Ticker */}
      {breakingNews && (
        <Link to={`/article/${breakingNews.id}`} className="bg-red-700 text-white px-4 sm:px-6 lg:px-8 py-2.5 flex items-center gap-4 shadow-inner hover:bg-red-800 transition block w-full group">
          <div className="flex items-center gap-4 w-full">
            <span className="font-bold text-xs tracking-wider bg-white text-red-700 px-2 py-0.5 rounded-sm shrink-0 flex items-center gap-1">
              <Bell className="w-3 h-3" /> 속보
            </span>
            <p className="text-sm font-medium line-clamp-1 group-hover:underline cursor-pointer">
              {breakingNews.title}
            </p>
          </div>
        </Link>
      )}
    </header>
  )
}
