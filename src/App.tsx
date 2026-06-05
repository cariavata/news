import Header from './components/Header';
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="col-span-1 lg:col-span-8">
          <MainContent />
        </div>
        <div className="col-span-1 lg:col-span-4">
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
