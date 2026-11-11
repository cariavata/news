import React, { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2, Upload, ExternalLink, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { compressImage } from '../lib/imageUtils';

export default function AdminAds() {
  const { adBanners, addAdBanner, deleteAdBanner } = useAppStore();
  const [formData, setFormData] = useState<{ imageUrl: string; linkUrl: string; title?: string }>({ 
    imageUrl: '', 
    linkUrl: '',
    title: ''
  });
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('배너 이미지를 등록해주세요 (URL 입력 또는 사진 파일 업로드).');
      return;
    }
    
    addAdBanner({
      imageUrl: formData.imageUrl,
      linkUrl: formData.linkUrl || '#',
      type: 'image'
    });

    setFormData({ imageUrl: '', linkUrl: '', title: '' });
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressImage(file, 800, 800, (base64) => {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
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

  // Only show custom uploaded image banners
  const customBanners = adBanners.filter(b => b.imageUrl);

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Header Info */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h1 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            관리자 배너 광고 관리
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            사이드바 영역에 노출되는 자체 배너(스폰서, 제휴, 공지 배너)를 직접 등록하고 관리할 수 있습니다.
            PC 화면에서는 우측 배너 영역에 한 줄씩(1열), 모바일 화면에서는 가로 2개씩(2열) 1:1 정사각형으로 노출됩니다.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">
              배너 이미지 등록 <span className="text-red-500">*</span>
              <span className="font-normal text-xs text-slate-500 ml-2">(모바일 가로 2열 / PC 1열 세로 나열, 1:1 정사각형)</span>
            </label>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input 
                type="url" 
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition flex-1 w-full text-sm"
                placeholder="외부 이미지 주소(URL) 직접 입력 (https://...)"
              />
              <span className="text-slate-400 font-bold text-xs shrink-0 self-center">또는</span>
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>컴퓨터에서 사진 선택</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            {formData.imageUrl && (
              <div className="mt-3 border border-slate-200 rounded-md p-3 bg-slate-50 inline-block w-full max-w-[260px]">
                <p className="text-xs font-bold text-slate-500 mb-2">등록 미리보기 (1:1 정사각형)</p>
                <div className="aspect-square w-full rounded border border-slate-200 bg-white overflow-hidden">
                  <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">
              연결될 링크 주소 (선택 사항)
            </label>
            <div className="relative">
              <input 
                type="url" 
                value={formData.linkUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                className="border border-slate-300 rounded-md p-3 pl-9 focus:ring-2 focus:ring-slate-900 outline-none transition w-full text-sm"
                placeholder="https://example.com (클릭 시 이동할 페이지 URL)"
              />
              <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            </div>
            <p className="text-xs text-slate-500">배너 클릭 시 방문자가 새 탭으로 이동할 웹사이트 주소를 입력하세요.</p>
          </div>

          <div className="mt-2 pt-5 border-t border-slate-200 flex items-center justify-between">
            <div>
              {isSuccess && (
                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  배너가 성공적으로 등록되었습니다!
                </span>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-slate-900 text-white font-bold px-8 py-3 rounded-md hover:bg-slate-800 transition shadow-sm text-sm"
            >
              배너 광고 등록하기
            </button>
          </div>
        </form>
      </div>

      {/* Registered Banners List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-sans text-slate-800">등록된 관리자 배너 목록</h2>
            <p className="text-sm text-slate-500 mt-1">등록된 배너는 사이트 우측 사이드바 및 기사 하단에 즉시 적용됩니다.</p>
          </div>
          <span className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
            총 {customBanners.length}개
          </span>
        </div>

        <div className="p-6">
          {customBanners.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-medium text-slate-600">등록된 배너 광고가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">상단 양식을 통해 첫 번째 배너를 등록해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {customBanners.map(banner => {
                const isSelected = selectedBannerId === banner.id;
                return (
                  <div 
                    key={banner.id} 
                    onClick={() => setSelectedBannerId(isSelected ? null : banner.id)}
                    className={`border rounded-lg p-4 bg-slate-50 relative group cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="overflow-hidden rounded-md border border-slate-200 bg-white mb-3 aspect-square max-h-56 flex items-center justify-center">
                      <img src={banner.imageUrl} alt="banner" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 truncate">
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{banner.linkUrl && banner.linkUrl !== '#' ? banner.linkUrl : '연결 링크 없음'}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                      <button 
                        onClick={(e) => handleDeleteClick(e, banner.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 py-1 px-2 rounded hover:bg-red-50 transition"
                        title="배너 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>배너 삭제</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">배너를 삭제할까요?</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              해당 배너가 사이트에서 영구적으로 삭제되며 즉시 화면에서 사라집니다.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition text-sm"
              >
                취소
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition text-sm"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
