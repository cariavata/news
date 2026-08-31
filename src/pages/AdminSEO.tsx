import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { SeoSettings } from '../types';
import { compressImage } from '../lib/imageUtils';
import { Download, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminSEO() {
  const { seoSettings, updateSeoSettings, articles, categories, companyPages } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
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
    robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://the-dailypulse.netlify.app/sitemap.xml',
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
      naverSiteVerification: seoSettings.naverSiteVerification || 'd060eade5473b610c0645fe41bbce092e0917fad',
      googleSiteVerification: seoSettings.googleSiteVerification || '57akzenSl71_GebyFfSJXrpeazAyphH49PDhUGOWR68',
      robotsTxt: seoSettings.robotsTxt || 'User-agent: *\nAllow: /\nSitemap: https://the-dailypulse.netlify.app/sitemap.xml'
    });
  }, [seoSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSeoSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      alert('✅ 모든 설정이 Firestore 데이터베이스에 실시간으로 안전하게 저장되었습니다!');
    } catch (err) {
      alert('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 400, 400, (base64) => {
        setFormData({ ...formData, logoUrl: base64 });
      });
    }
  };

  const getBaseDomain = () => {
    return 'https://the-dailypulse.netlify.app';
  };

  const handleAutoGenerateSitemap = () => {
    const domain = getBaseDomain();
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url>\n    <loc>${domain}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    for (const art of articles) {
      const lastmod = art.createdAt ? art.createdAt.split('T')[0] : today;
      xml += `  <url>\n    <loc>${domain}/article/${art.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    for (const cat of categories) {
      xml += `  <url>\n    <loc>${domain}/category/${cat.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    for (const page of companyPages) {
      xml += `  <url>\n    <loc>${domain}/info/${page.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    setFormData({ ...formData, sitemapXml: xml });
    alert('기사 및 카테고리를 반영한 최신 sitemap.xml 이 생성되었습니다. 하단의 [모든 설정 저장하기]를 눌러 적용하세요.');
  };

  const handleAutoGenerateRss = () => {
    const domain = getBaseDomain();
    const siteTitle = formData.title || 'DAILY PULSE | 신뢰할 수 있는 보건의료 소식';
    const siteDesc = formData.description || '우리 가족의 건강을 위한 가장 확실한 맥박, 건강 전문 미디어 데일리펄스입니다.';
    const nowRfc = new Date().toUTCString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
    xml += `  <title><![CDATA[${siteTitle}]]></title>\n  <link>${domain}</link>\n  <description><![CDATA[${siteDesc}]]></description>\n  <language>ko-kr</language>\n`;
    xml += `  <pubDate>${nowRfc}</pubDate>\n  <lastBuildDate>${nowRfc}</lastBuildDate>\n`;
    xml += `  <atom:link href="${domain}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    for (const art of articles.slice(0, 30)) {
      const cleanDesc = (art.excerpt || art.content || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 300);
      const artDate = art.createdAt ? new Date(art.createdAt).toUTCString() : nowRfc;
      xml += `  <item>\n    <title><![CDATA[${art.title}]]></title>\n    <link>${domain}/article/${art.id}</link>\n    <description><![CDATA[${cleanDesc}]]></description>\n    <dc:creator><![CDATA[${art.author || '데일리펄스'}]]></dc:creator>\n    <pubDate>${artDate}</pubDate>\n    <guid isPermaLink="true">${domain}/article/${art.id}</guid>\n  </item>\n`;
    }

    xml += `</channel>\n</rss>`;
    setFormData({ ...formData, rssXml: xml });
    alert('기사를 반영한 최신 rss.xml 이 생성되었습니다. 하단의 [모든 설정 저장하기]를 눌러 적용하세요.');
  };

  const handleDownloadFile = (filename: string, content: string) => {
    if (!content) {
      alert('다운로드할 내용이 없습니다. 먼저 [자동 생성]을 눌러 내용을 채워주세요.');
      return;
    }
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/xml;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

            {/* Sitemap XML */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-sm font-bold text-slate-800">사이트맵 (sitemap.xml)</label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleAutoGenerateSitemap}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    기사/카테고리 XML 자동생성
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDownloadFile('sitemap.xml', formData.sitemapXml || '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    파일 다운로드
                  </button>
                </div>
              </div>
              <textarea 
                rows={5}
                value={formData.sitemapXml}
                onChange={(e) => setFormData({...formData, sitemapXml: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-emerald-600 outline-none resize-y font-mono text-xs bg-white text-slate-800"
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://the-dailypulse.netlify.app/</loc>\n    <priority>1.0</priority>\n  </url>\n</urlset>`}
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">네이버 서치어드바이저 {'>'} 사이트맵 제출에 <code>sitemap.xml</code> 입력</span>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                  /sitemap.xml 열기 ↗
                </a>
              </div>
            </div>

            {/* RSS XML */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/70">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-sm font-bold text-slate-800">RSS 피드 (rss.xml)</label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={handleAutoGenerateRss}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    기사 RSS 피드 자동생성
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDownloadFile('rss.xml', formData.rssXml || '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    파일 다운로드
                  </button>
                </div>
              </div>
              <textarea 
                rows={5}
                value={formData.rssXml}
                onChange={(e) => setFormData({...formData, rssXml: e.target.value})}
                className="w-full border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-emerald-600 outline-none resize-y font-mono text-xs bg-white text-slate-800"
                placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>DAILY PULSE</title>\n    <link>https://the-dailypulse.netlify.app</link>\n  </channel>\n</rss>`}
              />
              <div className="flex justify-between items-center mt-2 pl-1">
                <span className="text-xs text-slate-500">네이버 서치어드바이저 {'>'} RSS 제출에 <code>https://the-dailypulse.netlify.app/rss.xml</code> 입력</span>
                <a href="/rss.xml" target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1">
                  /rss.xml 열기 ↗
                </a>
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

        <section className="bg-emerald-50/80 p-4 border border-emerald-200 rounded-md text-sm text-slate-700">
           <strong>💡 네이버 서치어드바이저 & 구글 서치콘솔 제출 가이드</strong><br/>
           1. <strong>사이트 소유확인</strong>: HTML 태그(d060eade5473b610c0645fe41bbce092e0917fad) 또는 HTML 파일 업로드 방식 모두 지원됩니다.<br/>
           2. <strong>사이트맵 제출</strong>: <code>sitemap.xml</code> 을 입력하여 제출하세요.<br/>
           3. <strong>RSS 제출</strong>: <code>https://the-dailypulse.netlify.app/rss.xml</code> 을 입력하여 제출하세요.
        </section>

        <div className="border-t border-slate-200 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            {savedSuccess && (
              <span className="text-emerald-700 font-bold inline-flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Firestore 데이터베이스에 성공적으로 저장되었습니다!
              </span>
            )}
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-slate-900 text-white font-bold px-8 py-3.5 rounded-lg hover:bg-slate-800 transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                모든 설정 저장하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
