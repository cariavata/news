import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';

export default function AdminSEO() {
  const { seoSettings, updateSeoSettings } = useAppStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    keywords: '',
    naverSiteVerification: '',
    googleAdsenseClient: '',
    customHeadTags: ''
  });

  useEffect(() => {
    setFormData(seoSettings);
  }, [seoSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeoSettings(formData);
    alert('SEO 및 검색 엔진 설정이 저장되었습니다.');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">검색 엔진 최적화 (SEO) 및 애드센스 설정</h1>
        <p className="text-sm text-slate-500 mt-2">네이버 서치어드바이저, 구글 수집, 사이트맵/로봇 등의 정보를 입력합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
        
        {/* Basic Meta Info */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-200">기본 메타태그 설정</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">사이트 제목 (Title)</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">사이트 설명 (Description)</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">키워드 (Keywords)</label>
              <input 
                type="text" 
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="콤마(,)로 구분"
              />
            </div>
          </div>
        </section>

        {/* Verification */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-200">검색 포털 연동 정보</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">네이버 서치어드바이저 (naver-site-verification)</label>
              <input 
                type="text" 
                value={formData.naverSiteVerification}
                onChange={(e) => setFormData({...formData, naverSiteVerification: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm"
                placeholder="영문/숫자 코드 입력"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">구글 애드센스 클라이언트 ID (ca-pub-xxx)</label>
              <input 
                type="text" 
                value={formData.googleAdsenseClient}
                onChange={(e) => setFormData({...formData, googleAdsenseClient: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm"
                placeholder="ca-pub-0000000000000000"
              />
            </div>
          </div>
        </section>

        <section className="bg-slate-50 p-4 border border-slate-200 rounded-md text-sm text-slate-700 mb-4">
           <strong>💡 웹페이지 수집 / 사이트맵 연동 안내 </strong><br/>
           현재 정적 배포 구조에서는 <code>/robots.txt</code> 와 <code>/sitemap.xml</code> 파일은 빌드 후 생성되는 정적 자원으로 관리됩니다. 
           추가 서치 콘솔용 스크립트나 구글 태그 관리자 등의 별도 코드는 직접 소스 내 <code>App.tsx</code>의 <code>&lt;Helmet&gt;</code> 컴포넌트에 주입되도록 구현되어 있습니다.
        </section>

        <div className="border-t border-slate-200 pt-6 flex justify-end">
          <button type="submit" className="bg-slate-900 text-white font-bold px-8 py-3 rounded-md hover:bg-slate-800 transition">
            모든 설정 저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
