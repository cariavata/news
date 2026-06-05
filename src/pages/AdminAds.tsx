import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useArticleStore';

export default function AdminAds() {
  const { adBanner, updateAdBanner } = useAppStore();
  const [formData, setFormData] = useState({ imageUrl: '', linkUrl: '' });

  useEffect(() => {
    setFormData(adBanner);
  }, [adBanner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdBanner(formData);
    alert('광고 배너가 저장되었습니다.');
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h1 className="text-xl font-bold font-sans text-slate-800">광고 배너 관리</h1>
        <p className="text-sm text-slate-500 mt-2">메인 사이드바에 노출되는 위치 기반 광고 배너를 설정합니다.</p>
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
            저장
          </button>
        </div>
      </form>
    </div>
  );
}
