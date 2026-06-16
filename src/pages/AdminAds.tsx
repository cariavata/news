import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2 } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';
import AdsenseBanner from '../components/AdsenseBanner';

export default function AdminAds() {
  const { adBanners, addAdBanner, deleteAdBanner, seoSettings } = useAppStore();
  const [formData, setFormData] = useState<{imageUrl: string, linkUrl: string, type?: 'image'|'adsense', adsenseSlot?: string}>({ imageUrl: '', linkUrl: '', type: 'image' });
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'adsense' && !formData.adsenseSlot) {
      alert('애드센스 광고 슬롯을 입력해주세요.');
      return;
    }
    if (formData.type !== 'adsense' && !formData.imageUrl) {
      alert('이미지를 등록해주세요.');
      return;
    }
    addAdBanner(formData);
    setFormData({ imageUrl: '', linkUrl: '', type: 'image', adsenseSlot: '' }); // Reset form
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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-xl font-bold font-sans text-slate-800">광고 배너 추가</h1>
          <p className="text-sm text-slate-500 mt-2">새로운 광고 배너를 추가합니다. 배너 이미지나 구글 애드센스 슬롯을 선택 등록할 수 있습니다.</p>
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
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-slate-700">애드센스 광고 슬롯 (data-ad-slot)</label>
              <div className="flex flex-col gap-2">
                <textarea 
                  placeholder={"구글 애드센스에서 복사한 코드 전체를 여기에 붙여넣기 하면 자동으로 슬롯 번호가 추출됩니다.\n예: <ins class=\"adsbygoogle\" ... data-ad-slot=\"1234567890\"></ins>"}
                  className="border border-slate-300 rounded-md p-3 text-xs text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none transition w-full min-h-[100px] font-mono"
                  onChange={(e) => {
                    const code = e.target.value;
                    const slotMatch = code.match(/data-ad-slot=["'](\d+)["']/);
                    if (slotMatch && slotMatch[1]) {
                      setFormData({...formData, adsenseSlot: slotMatch[1]});
                    }
                  }}
                />
                <input 
                  type="text" 
                  value={formData.adsenseSlot || ''}
                  onChange={(e) => setFormData({...formData, adsenseSlot: e.target.value})}
                  className="border border-slate-300 border-l-4 border-l-blue-500 rounded-md p-3 font-bold focus:ring-2 focus:ring-slate-900 outline-none transition w-full"
                  placeholder="추출된 슬롯 번호 (직접 입력도 가능)"
                />
              </div>
              <span className="text-xs text-slate-500">SEO 설정에서 애드센스 클라이언트 ID (ca-pub-...)가 입력되어 있어야 정상적으로 출력됩니다.</span>
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
            <button type="submit" className="bg-slate-900 text-white font-bold px-8 py-3 rounded-md hover:bg-slate-800 transition">
              추가하기
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold font-sans text-slate-800">등록된 커스텀 광고 배너 목록</h2>
          <p className="text-sm text-slate-500 mt-2">삭제할 배너를 클릭하여 선택한 후, 왼쪽에 나타나는 삭제 버튼을 눌러주세요.</p>
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
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {banner.type === 'adsense' && seoSettings.googleAdsenseClient ? (
                    <div className="w-full h-32 bg-slate-50 flex flex-col items-center justify-center mb-4 rounded overflow-hidden relative">
                      <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 z-10 pointer-events-none">
                        AdSense
                      </div>
                      <AdsenseBanner
                        client={seoSettings.googleAdsenseClient}
                        slot={banner.adsenseSlot!}
                      />
                    </div>
                  ) : banner.type === 'adsense' ? (
                     <div className="w-full h-32 bg-slate-100 flex flex-col items-center justify-center border border-slate-200 mb-4 rounded text-slate-900 font-bold">
                       <span>구글 애드센스 배너 (SEO 설정 필요)</span>
                       <span className="text-xs font-normal mt-1 text-slate-600">Slot: {banner.adsenseSlot}</span>
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
