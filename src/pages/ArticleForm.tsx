import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useArticleStore';
import { compressImage } from '../lib/imageUtils';

import { uploadImagesApi } from '../lib/api';

export default function ArticleForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { articles, addArticle, updateArticle, categories } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: searchParams.get('category') || categories[0]?.id || '',
    imageUrl: '',
    author: '데일리펄스',
    isFeatured: false,
    isTrending: false,
    isBreaking: false,
    doctorImage: '',
    doctorSpecialty: '',
    doctorName: '',
    hospitalName: '',
    cardNewsImages: [] as string[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoctorImage, setUploadingDoctorImage] = useState(false);
  const [uploadingCardImages, setUploadingCardImages] = useState(false);

  useEffect(() => {
    if (id) {
      const article = articles.find(a => a.id === id);
      if (article) {
        setFormData({
          title: article.title || '',
          excerpt: article.excerpt || '',
          content: article.content || '',
          categoryId: article.categoryId || categories[0]?.id || '',
          imageUrl: article.imageUrl || '',
          author: article.author || '데일리펄스',
          isFeatured: article.isFeatured || false,
          isTrending: article.isTrending || false,
          isBreaking: article.isBreaking || false,
          doctorImage: article.doctorImage || '',
          doctorSpecialty: article.doctorSpecialty || '',
          doctorName: article.doctorName || '',
          hospitalName: article.hospitalName || '',
          cardNewsImages: article.cardNewsImages || []
        });
      }
    } else if (categories.length > 0 && !formData.categoryId) {
      setFormData(prev => ({ ...prev, categoryId: searchParams.get('category') || categories[0].id }));
    }
  }, [id, articles, categories, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (uploadingImage || uploadingDoctorImage || uploadingCardImages) {
      alert("이미지가 아직 업로드/처리 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setIsSaving(true);
    try {
      if (id) {
        await updateArticle(id, formData);
      } else {
        await addArticle({ ...formData });
      }
      navigate('/admin');
    } catch (err) {
      console.error("Failed to save article:", err);
      alert("기사 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      try {
        const urls = await uploadImagesApi([file]);
        if (urls && urls.length > 0) {
          setFormData(prev => ({ ...prev, imageUrl: urls[0] }));
          return;
        }
      } catch (err) {}
      const base64 = await compressImage(file, 900, 900, 0.7);
      if (base64) {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDoctorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoctorImage(true);
    try {
      try {
        const urls = await uploadImagesApi([file]);
        if (urls && urls.length > 0) {
          setFormData(prev => ({ ...prev, doctorImage: urls[0] }));
          return;
        }
      } catch (err) {}
      const base64 = await compressImage(file, 400, 400, 0.7);
      if (base64) {
        setFormData(prev => ({ ...prev, doctorImage: base64 }));
      }
    } finally {
      setUploadingDoctorImage(false);
    }
  };

  const handleCardNewsImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingCardImages(true);
    try {
      try {
        const urls = await uploadImagesApi(files);
        if (urls && urls.length > 0) {
          setFormData(prev => ({ ...prev, cardNewsImages: [...prev.cardNewsImages, ...urls] }));
          return;
        }
      } catch (err) {}
      const compressedList = await Promise.all(files.map(f => compressImage(f, 900, 900, 0.7)));
      const valid = compressedList.filter(Boolean);
      if (valid.length > 0) {
        setFormData(prev => ({ ...prev, cardNewsImages: [...prev.cardNewsImages, ...valid] }));
      }
    } finally {
      setUploadingCardImages(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h1 className="text-xl font-bold font-sans text-slate-800">
          {id ? '기사 수정' : '새 기사 작성'}
        </h1>
        <Link to="/admin" className="text-slate-500 hover:text-slate-800 font-medium text-sm">
          취소 / 뒤로가기
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">제목</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
              placeholder="기사 제목을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">카테고리</label>
            <select 
              value={formData.categoryId}
              onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-slate-700">작성자</label>
            <input 
              readOnly
              disabled
              type="text" 
              value={formData.author}
              className="border border-slate-300 rounded-md p-3 bg-slate-100 text-slate-500 font-medium outline-none cursor-not-allowed"
            />
          </div>

          {formData.categoryId === 'opinion' && (
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-md p-6">
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">오피니언 전문의 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-slate-700">전문의명</label>
                  <input 
                    type="text" 
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                    className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
                    placeholder="예: 홍길동 원장"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-slate-700">병원명</label>
                  <input 
                    type="text" 
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({...formData, hospitalName: e.target.value})}
                    className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition"
                    placeholder="예: 서울ㅇㅇ병원"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-slate-700">진료과목 (전문의)</label>
                  <select 
                    value={formData.doctorSpecialty}
                    onChange={(e) => setFormData({...formData, doctorSpecialty: e.target.value})}
                    className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition bg-white"
                  >
                    <option value="">선택하세요</option>
                    <option value="정형외과전문의">정형외과전문의</option>
                    <option value="마취통증의학과전문의">마취통증의학과전문의</option>
                    <option value="재활의학과전문의">재활의학과전문의</option>
                    <option value="한의사">한의사</option>
                    <option value="산부인과전문의">산부인과전문의</option>
                    <option value="영상의학과전문의">영상의학과전문의</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-bold text-sm text-slate-700">전문의 사진 (500x500 권장)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input 
                      type="url" 
                      value={formData.doctorImage}
                      onChange={(e) => setFormData({...formData, doctorImage: e.target.value})}
                      className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition flex-1 w-full"
                      placeholder="이미지 URL을 입력하세요"
                    />
                    <span className="text-slate-400 font-bold shrink-0">OR</span>
                    <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300">
                      <span>사진 파일 업로드</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleDoctorImageUpload} />
                    </label>
                  </div>
                  {formData.doctorImage && (
                    <img src={formData.doctorImage} alt="doctor preview" className="mt-2 w-[150px] h-[150px] object-cover rounded-md border border-slate-200" />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">요약문 (Excerpt)</label>
            <textarea 
              rows={2}
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition resize-none"
              placeholder="메인 페이지에 표시될 요약 내용을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-sm text-slate-700">기사 썸네일 (선택 사항)</label>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                💡 미등록 시 자동 텍스트 썸네일 적용 (DB 용량 0% 소모)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <input 
                type="url" 
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition flex-1 w-full text-sm"
                placeholder="이미지 URL (비워둘 시 감각적인 텍스트 썸네일로 자동 표시됩니다)"
              />
              <span className="text-slate-400 font-bold shrink-0">OR</span>
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-md transition font-medium text-sm whitespace-nowrap shrink-0 border border-slate-300 flex items-center gap-2">
                <span>{uploadingImage ? '업로드 중...' : '내 컴퓨터에서 사진 추가'}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({...formData, imageUrl: ''})}
                  className="px-3 py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-xs font-bold transition whitespace-nowrap shrink-0"
                >
                  이미지 제거 (텍스트 썸네일 사용)
                </button>
              )}
            </div>
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="preview" className="mt-2 h-32 w-auto object-cover rounded-md border border-slate-200" />
            )}
          </div>

          {formData.categoryId === 'cardnews' && (
            <div className="flex flex-col gap-2 md:col-span-2 bg-blue-50 border border-blue-200 rounded-md p-6">
              <h3 className="font-bold text-slate-800 mb-2 border-b border-blue-200 pb-2">카드뉴스 이미지 (정사각형 비율 권장)</h3>
              <p className="text-sm text-slate-600 mb-4">카드뉴스의 여러 장의 이미지를 순서대로 업로드하세요. 드래그하여 업로드된 이미지 순서를 변경할 수 있습니다.</p>
              
              <div className="flex flex-wrap gap-4 mb-4">
                {formData.cardNewsImages.map((imgUrl, idx) => (
                  <div 
                    key={idx} 
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', idx.toString());
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                      const toIdx = idx;
                      if (fromIdx !== toIdx) {
                        const newArr = [...formData.cardNewsImages];
                        const [movedItem] = newArr.splice(fromIdx, 1);
                        newArr.splice(toIdx, 0, movedItem);
                        setFormData({...formData, cardNewsImages: newArr});
                      }
                    }}
                    className="relative group rounded-md border border-slate-300 overflow-hidden w-24 h-24 sm:w-32 sm:h-32 cursor-move"
                  >
                    <img src={imgUrl} alt={`Card news ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-1 opacity-0 group-hover:opacity-100 transition">
                      <div className="flex justify-between">
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          if (idx > 0) {
                            const newArr = [...formData.cardNewsImages];
                            [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
                            setFormData({...formData, cardNewsImages: newArr});
                          }
                        }} className="text-white hover:text-blue-300 px-1 disabled:opacity-50" disabled={idx === 0}>◀</button>
                        <button type="button" onClick={(e) => {
                          e.stopPropagation();
                          if (idx < formData.cardNewsImages.length - 1) {
                            const newArr = [...formData.cardNewsImages];
                            [newArr[idx + 1], newArr[idx]] = [newArr[idx], newArr[idx + 1]];
                            setFormData({...formData, cardNewsImages: newArr});
                          }
                        }} className="text-white hover:text-blue-300 px-1 disabled:opacity-50" disabled={idx === formData.cardNewsImages.length - 1}>▶</button>
                      </div>
                      <button type="button" onClick={(e) => {
                        e.stopPropagation();
                        setFormData({
                          ...formData, 
                          cardNewsImages: formData.cardNewsImages.filter((_, i) => i !== idx)
                        });
                      }} className="bg-red-500 text-white rounded text-xs py-1 mt-auto hover:bg-red-600 font-bold">삭제</button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1 rounded pointer-events-none">{idx + 1}</span>
                  </div>
                ))}
                
                <label className="cursor-pointer border-2 border-dashed border-blue-300 hover:bg-blue-100 text-blue-500 flex flex-col items-center justify-center rounded-md font-medium text-sm transition w-24 h-24 sm:w-32 sm:h-32">
                  <span className="text-2xl mb-1">+</span>
                  <span>사진 추가</span>
                  <input type="file" className="hidden" accept="image/*" multiple onChange={handleCardNewsImagesUpload} />
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 md:col-span-2 bg-slate-50 p-4 border border-slate-200 rounded-md mt-2">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">홈페이지 노출 설정 (위치 배정)</h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  className="w-5 h-5 text-slate-900 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">주요 기사 (가장 큰 배너)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isTrending}
                  onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                  className="w-5 h-5 text-slate-900 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">실시간 많이 본 뉴스 (사이드바)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isBreaking}
                  onChange={(e) => setFormData({...formData, isBreaking: e.target.checked})}
                  className="w-5 h-5 text-red-600 rounded border-red-300"
                />
                <span className="text-sm font-medium text-red-700">상단 속보 티커</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">※ '건강/의학' 카테고리 글은 하단 건강 & 웰니스 섹션에 자동으로 배정됩니다. 여러 개를 체크할 경우 여러 위치에 동시에 표출될 수 있습니다.</p>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-bold text-sm text-slate-700">본문 내용</label>
            <textarea 
              rows={10}
              required
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="border border-slate-300 rounded-md p-3 focus:ring-2 focus:ring-slate-900 outline-none transition resize-y"
              placeholder="전체 기사 내용을 입력하세요"
            />
          </div>

        </div>
        
        <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-200">
           <Link to="/admin" className="px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-md hover:bg-slate-50 transition">
             취소
           </Link>
           <button 
             type="submit" 
             disabled={isSaving}
             className="px-8 py-3 bg-slate-900 text-white font-bold rounded-md hover:bg-slate-800 disabled:bg-slate-400 transition shadow-sm flex items-center gap-2"
           >
             {isSaving ? (
               <>
                 <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                 <span>저장 중...</span>
               </>
             ) : (
               id ? '수정 완료' : '기사 등록'
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
