import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { SeoSettings } from '../types';
import { compressImage } from '../lib/imageUtils';

export default function AdminSEO() {
  const { seoSettings, updateSeoSettings } = useAppStore();
  const [formData, setFormData] = useState<SeoSettings>({
    siteName: '',
    logoUrl: '',
    title: '',
    description: '',
    keywords: '',
    naverSiteVerification: '',
    googleSiteVerification: '',
    googleAdsenseClient: '',
    customHeadTags: '',
    robotsTxt: 'User-agent: *\nAllow: /',
    adsTxt: '',
    sitemapXml: '',
    rssXml: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    homeIntroText: '',
    homeIntroEnabled: true
  });

  useEffect(() => {
    setFormData({
      ...seoSettings,
      homeIntroText: seoSettings.homeIntroText ?? '연결된 세계에 신선하고 신뢰할 수 있으며 엄격하게 팩트 체크된 저널리즘을 제공합니다.',
      homeIntroEnabled: seoSettings.homeIntroEnabled !== false,
    });
  }, [seoSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSeoSettings(formData);
    alert('기본 설정 및 검색 엔진 설정이 저장되었습니다.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, 400, (base64) => {
        setFormData({ ...formData, logoUrl: base64 });
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">사이트 기본 정보 및 검색 최적화 (SEO)</h1>
        <p className="text-sm text-slate-500 mt-2">사이트 명칭, 로고, 네이버 서치어드바이저, 구글 수집 등의 정보를 입력합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
        
        {/* Site Identity Info */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-200">사이트 기본 정보</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">홈페이지 명칭 설정</label>
              <input 
                type="text" 
                value={formData.siteName}
                onChange={(e) => setFormData({...formData, siteName: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="예: DAILY PULSE"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">홈페이지 메인 소개 문구</label>
              <textarea 
                rows={2}
                value={formData.homeIntroText || ''}
                onChange={(e) => setFormData({...formData, homeIntroText: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                placeholder="메인 페이지의 배경 섹션에 표시될 소개 문구"
              />
              <div className="mt-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="homeIntroEnabled"
                  checked={formData.homeIntroEnabled !== false}
                  onChange={(e) => setFormData({...formData, homeIntroEnabled: e.target.checked})}
                />
                <label htmlFor="homeIntroEnabled" className="text-sm text-slate-600 cursor-pointer">
                  메인 페이지에 소개 문구 켜기 (비쥬얼 섹션 표시)
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">상단 로고 이미지 (선택, 권장 비율 가로형)</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input 
                  type="url" 
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  className="w-full sm:flex-1 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="로고 이미지 URL 또는 컴퓨터에서 업로드"
                />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300">
                  <span>내 컴퓨터에서 업로드</span>
                  <input type="file" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleImageUpload} />
                </label>
              </div>
              {formData.logoUrl && (
                <div className="mt-4 border border-slate-200 rounded-md p-4 bg-slate-100/50 inline-block">
                  <img src={formData.logoUrl} alt="Logo preview" className="h-12 object-contain" />
                </div>
              )}
            </div>
          </div>
        </section>

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
          </div>
        </section>

        {/* SNS Share (Open Graph) Info */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-200">SNS/메신저 공유 설정 (Open Graph)</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">공유 제목 (og:title)</label>
              <input 
                type="text" 
                value={formData.ogTitle || ''}
                onChange={(e) => setFormData({...formData, ogTitle: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="카카오톡, 페이스북 등에 공유될 때 표시될 제목"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">공유 설명 (og:description)</label>
              <textarea 
                rows={2}
                value={formData.ogDescription || ''}
                onChange={(e) => setFormData({...formData, ogDescription: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                placeholder="카카오톡, 페이스북 등에 공유될 때 표시될 설명"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">공유 이미지 (og:image) - 권장 1200x630px</label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <input 
                  type="url" 
                  value={formData.ogImage || ''}
                  onChange={(e) => setFormData({...formData, ogImage: e.target.value})}
                  className="w-full sm:flex-1 border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder="공유 이미지 URL 또는 컴퓨터에서 업로드"
                />
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300">
                  <span>내 컴퓨터에서 업로드</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/png, image/jpeg" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file, 1200, 630, (base64) => {
                          setFormData({ ...formData, ogImage: base64 });
                        });
                      }
                    }} 
                  />
                </label>
              </div>
              {formData.ogImage && (
                <div className="mt-4 border border-slate-200 rounded-md p-4 bg-slate-100/50 inline-block w-full max-w-sm">
                  <img src={formData.ogImage} alt="OG preview" className="w-full h-auto aspect-[1.9/1] object-cover rounded-md" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Verification */}
        <section>
          <h3 className="font-bold text-lg text-slate-900 mb-4 pb-2 border-b border-slate-200">검색 엔진 및 로봇 통제</h3>
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">robots.txt (검색 로봇 제어)</label>
              <textarea 
                rows={4}
                value={formData.robotsTxt}
                onChange={(e) => setFormData({...formData, robotsTxt: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none font-mono text-sm bg-slate-50"
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">네이버 서치어드바이저 {'>'} 검증 {'>'} robots.txt 에서 확인 가능</span>
                <a href="/robots.txt" target="_blank" className="text-xs text-[#a062ff] hover:underline">/robots.txt 열기</a>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">ads.txt (구글 애드센스 등)</label>
              <textarea 
                rows={4}
                value={formData.adsTxt}
                onChange={(e) => setFormData({...formData, adsTxt: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none font-mono text-sm bg-slate-50"
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">애드센스 승인을 위해 ads.txt 내용을 붙여넣으세요.</span>
                <a href="/ads.txt" target="_blank" className="text-xs text-[#a062ff] hover:underline">/ads.txt 열기</a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">사이트맵 (sitemap.xml)</label>
              <textarea 
                rows={4}
                value={formData.sitemapXml}
                onChange={(e) => setFormData({...formData, sitemapXml: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none font-mono text-sm bg-slate-50"
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>...`}
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">sitemap.xml 내용을 복사하여 붙여넣으세요.</span>
                <a href="/sitemap.xml" target="_blank" className="text-xs text-[#a062ff] hover:underline">/sitemap.xml 열기</a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">RSS 피드 (rss.xml)</label>
              <textarea 
                rows={4}
                value={formData.rssXml}
                onChange={(e) => setFormData({...formData, rssXml: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none font-mono text-sm bg-slate-50"
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>...`}
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">rss.xml 내용을 복사하여 붙여넣으세요.</span>
                <a href="/rss.xml" target="_blank" className="text-xs text-[#a062ff] hover:underline">/rss.xml 열기</a>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">검색 포털 메타태그 (Meta Keywords)</label>
              <textarea 
                rows={3}
                value={formData.keywords}
                onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none resize-none text-sm"
              />
              <span className="text-xs text-slate-500 block mt-2 pl-1">네이버, 구글 등 검색 포털에서 검색이 잘 되게 하는 키워드를 입력합니다.</span>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">네이버 사이트 소유확인 (Meta Tag)</label>
              <input 
                type="text" 
                value={formData.naverSiteVerification}
                onChange={(e) => setFormData({...formData, naverSiteVerification: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm bg-slate-50"
                placeholder='<meta name="naver-site-verification" content="..." />'
              />
              <span className="text-xs text-slate-500 block mt-2 pl-1">네이버 웹마스터도구에서 제공하는 메타태그 전체 또는 content 값을 입력하세요.</span>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">구글 서치콘솔 소유확인 (Meta Tag)</label>
              <input 
                type="text" 
                value={formData.googleSiteVerification || ''}
                onChange={(e) => setFormData({...formData, googleSiteVerification: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none font-mono text-sm bg-slate-50"
                placeholder='<meta name="google-site-verification" content="..." />'
              />
              <span className="text-xs text-slate-500 block mt-2 pl-1">구글 서치콘솔(Search Console)에서 제공하는 메타태그 전체 또는 content 값을 입력하세요.</span>
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

        <section className="bg-emerald-50/60 p-4 border border-emerald-200 rounded-md text-sm text-slate-700 mb-4">
           <strong>💡 웹페이지 수집 / 사이트맵 연동 안내 </strong><br/>
           서버가 <code>/robots.txt</code> 와 <code>/sitemap.xml</code>을 실시간으로 동적 생성하여 항상 최신 기사 목록이 연동됩니다. 
           또한, 네이버/구글 검색 봇이 <strong>각 개별 기사(/article/:id)</strong>를 수집할 때 실제 기사 제목, 요약글, 대표 이미지를 <strong>서버에서 동적으로 메타태그(Open Graph 포함)에 주입</strong>해 제공하므로 검색엔진 등록 및 소셜 공유가 완벽히 처리됩니다.
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
