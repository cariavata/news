import { useState } from 'react';
import { useAppStore } from '../store/useArticleStore';
import { Trash2 } from 'lucide-react';

export default function AdminInquiries() {
  const { inquiries, deleteInquiry, deleteMultipleInquiries } = useAppStore();
  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInquiries(inquiries.map(i => i.id));
    } else {
      setSelectedInquiries([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedInquiries(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    if (selectedInquiries.length === 0) return;
    if (window.confirm('선택한 문의를 삭제하시겠습니까?')) {
      deleteMultipleInquiries(selectedInquiries);
      setSelectedInquiries([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 mb-1">광고 문의 관리</h2>
          <p className="text-sm text-slate-600">사이트에서 접수된 광고 문의 및 고객 의견을 확인하고 관리합니다.</p>
        </div>
        {selectedInquiries.length > 0 && (
          <button 
            onClick={handleDeleteSelected}
            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded transition"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium text-sm">선택 삭제 ({selectedInquiries.length})</span>
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    checked={inquiries.length > 0 && selectedInquiries.length === inquiries.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4">접수일시</th>
                <th className="p-4">상호명 / 성명</th>
                <th className="p-4">연락처</th>
                <th className="p-4">문의내용</th>
                <th className="p-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    접수된 문의가 없습니다.
                  </td>
                </tr>
              ) : (
                inquiries.map(inquiry => (
                  <tr key={inquiry.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                        checked={selectedInquiries.includes(inquiry.id)}
                        onChange={() => handleSelectOne(inquiry.id)}
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(inquiry.createdAt).toLocaleString('ko-KR')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{inquiry.companyName}</div>
                      <div className="text-xs text-slate-500">{inquiry.name}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{inquiry.phone}</div>
                      <div className="text-xs text-slate-500">{inquiry.email}</div>
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="line-clamp-2 text-slate-600 whitespace-pre-wrap">{inquiry.message}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          if(window.confirm('이 문의를 삭제하시겠습니까?')) {
                            deleteInquiry(inquiry.id);
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 transition p-2"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
