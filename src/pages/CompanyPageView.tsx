import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReactMarkdown from 'react-markdown';

export default function CompanyPageView() {
  const { id } = useParams();
  const { companyPages } = useAppStore();
  const page = companyPages.find(p => p.id === id) || companyPages.find(p => p.title === id);

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center bg-white p-10 rounded-lg shadow-sm border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">존재하지 않거나 삭제된 페이지입니다.</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <article className="bg-white border border-slate-200 p-8 sm:p-12 md:p-16 rounded-lg shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-10 pb-6 border-b border-slate-200">
            {page.title}
          </h1>
          <div className="prose prose-slate prose-lg max-w-none font-sans text-slate-800 leading-[1.8] break-keep whitespace-pre-wrap">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
