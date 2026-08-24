import { useEffect } from 'react';
import Header from '../components/Header';
import VisualSection from '../components/VisualSection';
import MainContent from '../components/MainContent';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { useAppStore } from '../store/useArticleStore';

export default function Home() {
  const fetchInitialArticles = useAppStore(s => s.fetchInitialArticles);

  useEffect(() => {
    fetchInitialArticles();
  }, [fetchInitialArticles]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <VisualSection />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-1 lg:col-span-9">
          <MainContent />
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
