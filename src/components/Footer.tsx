import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function Footer() {
  const { categories, companyPages, seoSettings, isAuthenticated, addInquiry } = useAppStore();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    companyName: '',
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.companyName || !contactForm.name || !contactForm.phone || !contactForm.email || !contactForm.message) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    addInquiry(contactForm);
    alert('문의가 성공적으로 접수되었습니다.');
    setIsContactModalOpen(false);
    setContactForm({ companyName: '', name: '', phone: '', email: '', message: '' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 mt-16 border-t-[8px] border-slate-900">
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">데일리 펄스</h2>
            <p className="text-sm font-sans max-w-sm mb-6 leading-relaxed break-keep">
              {seoSettings.description}
            </p>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs tracking-widest mb-3">섹션</h4>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.id}`} className="text-sm hover:text-white transition">
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Corporate */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs tracking-widest mb-3">회사 소개</h4>
            {companyPages.filter(p => !['careers', 'guidelines'].includes(p.id)).map(page => (
              <Link key={page.id} to={`/info/${page.id}`} className="text-sm hover:text-white transition">
                {page.title}
              </Link>
            ))}
            <button onClick={() => setIsContactModalOpen(true)} className="text-sm text-left hover:text-white transition cursor-pointer">
              광고 문의하기
            </button>
          </div>
       </div>

       <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} 데일리 펄스 미디어. 모든 권리 보유.
          </p>
          <Link to={isAuthenticated ? "/admin" : "/admin/login"} className="text-xs text-slate-500 hover:text-white hover:underline transition font-mono">
            {isAuthenticated ? '관리자 페이지' : '관리자 로그인'}
          </Link>
       </div>

       {/* Contact Us Modal */}
       {isContactModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] overflow-hidden flex flex-col">
             <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white shrink-0">
               <h3 className="font-bold text-lg text-slate-900">광고 문의하기</h3>
               <button onClick={() => setIsContactModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition p-1 rounded-full hover:bg-slate-100">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <form onSubmit={handleContactSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">상호명 <span className="text-red-500">*</span></label>
                 <input type="text" required value={contactForm.companyName} onChange={e => setContactForm({...contactForm, companyName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 text-sm" placeholder="상호명을 입력하세요" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">성명 <span className="text-red-500">*</span></label>
                 <input type="text" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 text-sm" placeholder="성명을 입력하세요" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">핸드폰 <span className="text-red-500">*</span></label>
                 <input type="tel" required value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 text-sm" placeholder="연락가능한 핸드폰 번호를 입력하세요" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">이메일 <span className="text-red-500">*</span></label>
                 <input type="email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 text-sm" placeholder="이메일 주소를 입력하세요" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">문의내용 <span className="text-red-500">*</span></label>
                 <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none text-slate-900 text-sm resize-none" placeholder="광고 문의하실 내용을 입력하세요" />
               </div>
               <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 mt-2 rounded transition shadow-sm">
                 문의 접수하기
               </button>
             </form>
           </div>
         </div>
       )}
    </footer>
  )
}

