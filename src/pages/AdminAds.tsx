import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2 } from 'lucide-react';

export default function AdminAds() {
  const { adBanners, addAdBanner, deleteAdBanner } = useAppStore();
  const [formData, setFormData] = useState({ imageUrl: '', linkUrl: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('이미지를 등록해주세요.');
      return;
    }
    addAdBanner(formData);
    setFormData({ imageUrl: '', linkUrl: '' }); // Reset form
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 광고 배너를 정말 삭제하시겠습니까?')) {
      deleteAdBanner(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-xl font-bold font-sans text-slate-800">광고 배너 추가</h1>
          <p className="text-sm text-slate-500 mt-2">새로운 광고 배너를 추가합니다. 이미지는 URL을 직접 등록하거나 내 컴퓨터에서 업로드할 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
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
        </div>
        <div className="p-6">
          {adBanners.length === 0 ? (
            <div className="text-center text-slate-500 py-10 font-medium">등록된 광고 배너가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {adBanners.map(banner => (
                <div key={banner.id} className="border border-slate-200 rounded-md p-4 bg-slate-50 relative group">
                  <img src={banner.imageUrl} alt="banner" className="w-full h-auto object-cover rounded mb-4" />
                  <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-700 hover:text-slate-900 truncate block">
                    {banner.linkUrl || '링크 없음'}
                  </a>
                  <button 
                    onClick={() => handleDelete(banner.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 shadow"
                    title="배너 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
