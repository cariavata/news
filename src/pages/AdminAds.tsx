import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';
import AdsenseBanner from '../components/AdsenseBanner';

export default function AdminAds() {
  const { adBanners, addAdBanner, deleteAdBanner, seoSettings, updateSeoSettings } = useAppStore();
  const [formData, setFormData] = useState<{imageUrl: string, linkUrl: string, type?: 'image'|'adsense', adsenseSlot?: string}>({ imageUrl: '', linkUrl: '', type: 'image' });
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const publisherId = "pub-6799823492487492";
  const clientId = "ca-pub-6799823492487492";
  const scriptSnippet = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}" crossorigin="anonymous"></script>`;
  const adsTxtSnippet = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`;
  const metaSnippet = `<meta name="google-adsense-account" content="${clientId}">`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSnippetPaste = (code: string) => {
    // Extract slot
    const slotMatch = code.match(/data-ad-slot=["'](\d+)["']/);
    if (slotMatch && slotMatch[1]) {
      setFormData(prev => ({ ...prev, adsenseSlot: slotMatch[1] }));
    } else {
      const pureDigits = code.trim();
      if (/^\d{8,14}$/.test(pureDigits)) {
        setFormData(prev => ({ ...prev, adsenseSlot: pureDigits }));
      }
    }

    // Extract client if present
    const clientMatch = code.match(/data-ad-client=["'](ca-pub-\d+)["']/) || code.match(/client=(ca-pub-\d+)/);
    if (clientMatch && clientMatch[1]) {
      if (seoSettings.googleAdsenseClient !== clientMatch[1]) {
        updateSeoSettings({ ...seoSettings, googleAdsenseClient: clientMatch[1] });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'adsense') {
      if (!formData.adsenseSlot) {
        alert('애드센스 광고 슬롯 번호를 입력해주세요.');
        return;
      }
      if (!seoSettings.googleAdsenseClient) {
        updateSeoSettings({ ...seoSettings, googleAdsenseClient: clientId });
      }
    } else {
      if (!formData.imageUrl) {
        alert('이미지를 등록해주세요.');
        return;
      }
    }
    addAdBanner(formData);
    setFormData({ imageUrl: '', linkUrl: '', type: 'image', adsenseSlot: '' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 800, 800, (base64) => {
        setFormData({ ...formData, imageUrl: base64 });
      });
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const executeDelete = () => {
    if (confirmDeleteId) {
      deleteAdBanner(confirmDeleteId);
      setConfirmDeleteId(null);
      if (selectedBannerId === confirmDeleteId) {
        setSelectedBannerId(null);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* AdSense Verification Status Box */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                구글 애드센스 사이트 소유권 확인 & 상태
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  코드 삽입 완료
                </span>
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                게시자 ID: <strong className="font-mono text-slate-800">{publisherId}</strong> / 도메인: <strong className="font-mono text-blue-700">https://the-dailypulse.netlify.app</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-blue-100 flex flex-col gap-3">
          <div className="bg-white/80 border border-blue-100 rounded-lg p-3 text-xs text-slate-700 leading-relaxed">
            <p className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              구글 애드센스 소유권 확인 절차:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
              <li>구글 애드센스 사이트 메뉴의 <strong>[사이트 소유권을 확인하세요]</strong> 화면으로 이동합니다.</li>
              <li>확인 방법(애드센스 코드 스니펫, Ads.txt, 메타 태그) 중 아무거나 선택합니다. (3가지 모두 사이트에 완벽 적용 완료)</li>
              <li>하단의 <strong className="text-blue-700">☑ 코드를 삽입했습니다</strong> 체크박스를 선택한 후 <strong className="bg-blue-600 text-white px-2 py-0.5 rounded text-[11px]">확인</strong> 버튼을 클릭하세요.</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => copyToClipboard(scriptSnippet, 'script')}
              className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition group"
            >
              <span className="font-medium truncate">1. 코드 스니펫 복사</span>
              {copiedKey === 'script' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(adsTxtSnippet, 'ads')}
              className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition group"
            >
              <span className="font-medium truncate">2. Ads.txt 복사</span>
              {copiedKey === 'ads' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(metaSnippet, 'meta')}
              className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-700 transition group"
            >
              <span className="font-medium truncate">3. 메타태그 복사</span>
              {copiedKey === 'meta' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-xl font-bold font-sans text-slate-800">광고 배너 추가</h1>
          <p className="text-sm text-slate-500 mt-2">새로운 광고 배너를 추가합니다. 일반 이미지 배너 또는 구글 애드센스 광고 단위를 등록할 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">배너 종류</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.type !== 'adsense'} 
                  onChange={() => setFormData({ ...formData, type: 'image' })} 
                />
                <span className="text-sm font-medium">일반 이미지 배너</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={formData.type === 'adsense'} 
                  onChange={() => setFormData({ ...formData, type: 'adsense' })} 
                />
                <span className="text-sm font-medium">구글 애드센스</span>
              </label>
            </div>
          </div>

          {formData.type === 'adsense' ? (
            <div className="flex flex-col gap-3">
              <label className="font-bold text-sm text-slate-700 flex items-center justify-between">
                <span>애드센스 광고 슬롯 (data-ad-slot)</span>
                <span className="text-xs font-normal text-blue-600 font-mono">
                  Client: {seoSettings.googleAdsenseClient || clientId}
                </span>
              </label>
              <div className="flex flex-col gap-2">
                <textarea 
                  placeholder={"구글 애드센스 광고 단위 코드 전체(또는 10자리 슬롯 번호)를 여기에 붙여넣기 하시면 슬롯 번호가 자동 추출됩니다.\n예: <ins class=\"adsbygoogle\" ... data-ad-slot=\"1234567890\"></ins>"}
                  className="border border-slate-300 rounded-md p-3 text-xs text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition w-full min-h-[100px] font-mono leading-relaxed"
                  onChange={(e) => handleSnippetPaste(e.target.value)}
                />
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    value={formData.adsenseSlot || ''}
                    onChange={(e) => setFormData({...formData, adsenseSlot: e.target.value.trim()})}
                    className="border border-slate-300 border-l-4 border-l-blue-500 rounded-md p-3 font-bold text-sm focus:ring-2 focus:ring-slate-900 outline-none transition w-full font-mono"
                    placeholder="추출된 슬롯 번호 (예: 1234567890)"
                  />
                  {formData.adsenseSlot && (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-3 rounded-md shrink-0 whitespace-nowrap">
                      ✓ 슬롯 인식됨
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                구글 애드센스 관리자 콘솔의 <strong>[광고] → [광고 단위 기준]</strong>에서 디스플레이 배너를 생성하신 후 슬롯 코드를 등록하시면 사이드바 영역 등에 자동으로 게재됩니다.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-slate-700">배너 이미지 (권장 비율 1:1 또는 4:5)</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <input 
                    type="url" 
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition flex-1 w-full"
                    placeholder="외부 이미지 URL (https://...)"
                  />
                  <span className="text-slate-400 font-bold shrink-0">OR</span>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300">
                    <span>내 컴퓨터에서 사진 불러오기</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                {formData.imageUrl && (
                  <div className="mt-4 border border-slate-200 rounded-md p-2 bg-slate-50 inline-block w-full max-w-[300px]">
                    <img src={formData.imageUrl} alt="preview" className="w-full h-auto object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm text-slate-700">연결될 링크 (클릭 시 이동할 주소)</label>
                <input 
                  type="url" 
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                  className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
                  placeholder="https://google.com"
                />
              </div>
            </>
          )}

          <div className="mt-4 pt-6 border-t border-slate-200 flex justify-end">
            <button type="submit" className="bg-slate-900 text-white font-bold px-8 py-3 rounded-md hover:bg-slate-800 transition shadow-sm">
              광고 배너 등록하기
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold font-sans text-slate-800">등록된 커스텀 광고 배너 목록</h2>
          <p className="text-sm text-slate-500 mt-2">삭제할 배너를 클릭하여 선택한 후, 나타나는 삭제 버튼을 눌러주세요.</p>
        </div>
        <div className="p-6">
          {adBanners.length === 0 ? (
            <div className="text-center text-slate-500 py-10 font-medium">등록된 광고 배너가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {adBanners.map(banner => {
                const isSelected = selectedBannerId === banner.id;
                return (
                <div 
                  key={banner.id} 
                  onClick={() => setSelectedBannerId(isSelected ? null : banner.id)}
                  className={`border rounded-md p-4 bg-slate-50 relative group cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {banner.type === 'adsense' ? (
                    <div className="w-full h-36 bg-slate-100 border border-slate-200 flex flex-col items-center justify-center mb-4 rounded overflow-hidden relative p-3 text-center">
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm">
                        Google AdSense
                      </div>
                      <span className="text-slate-800 font-bold text-sm">구글 애드센스 배너</span>
                      <span className="text-xs font-mono text-slate-600 mt-1 bg-white px-2.5 py-1 rounded border border-slate-200">
                        Slot: {banner.adsenseSlot}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        Client: {seoSettings.googleAdsenseClient || clientId}
                      </span>
                    </div>
                  ) : (
                    <img src={banner.imageUrl} alt="banner" className="w-full h-auto object-cover rounded mb-4" />
                  )}
                  {banner.type !== 'adsense' && (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-700 hover:text-slate-900 truncate block">
                      {banner.linkUrl || '링크 없음'}
                    </a>
                  )}
                  {isSelected && (
                    <button 
                      onClick={(e) => handleDeleteClick(e, banner.id)}
                      className="absolute -top-3 -left-3 bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-full shadow-lg z-50 transition-colors"
                      title="배너 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">정말로 삭제할까요?</h3>
            <p className="text-slate-600 text-sm mb-6">해당 광고 배너가 목록에서 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              >
                아니오
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
