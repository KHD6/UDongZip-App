// src/components/map/PinCreateModal.jsx
import React, { useState } from "react";
import { X, HeartPulse, Store, Users, Calendar } from "lucide-react";

export default function PinCreateModal({ isOpen, onClose, onSave, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("hospital");
  const [description, setDescription] = useState("");
  const [expireHours, setExpireHours] = useState(""); // 만료 시간 (모임용)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // 만료일시 계산 (선택한 시간이 있으면)
    let expiresAt = null;
    if (expireHours) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + parseInt(expireHours) * 60 * 60 * 1000);
    }

    onSave({
      title: title.trim(),
      category,
      description: description.trim(),
      expiresAt
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-slate-800 text-base">📍 동네 정보 등록하기</h3>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 분류 선택 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 ml-1">장소 분류</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'hospital', label: '동물병원', icon: HeartPulse },
                { id: 'cafe', label: '펫카페/용품', icon: Store },
                { id: 'meetup', label: '모임장소', icon: Users },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all border ${
                    category === cat.id 
                      ? "bg-[#c29b7c] text-white border-[#c29b7c] shadow-md shadow-orange-900/10" 
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                  }`}
                >
                  <cat.icon size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 장소 이름 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 ml-1">장소/모임 이름</label>
            <input 
              type="text"
              required
              placeholder="예: 숲속 반려동물 놀이터"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#c29b7c] transition-all text-slate-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* 상세 정보 */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-600 ml-1">상세 추천 정보</label>
            <textarea 
              rows={3}
              placeholder="과잉진료 없고 원장님이 아기를 아주 예뻐해요!"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-sm font-medium outline-none focus:border-[#c29b7c] transition-all text-slate-700 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* 시간 제한 모임용 설정 */}
          {category === 'meetup' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-3 duration-200">
              <label className="text-xs font-black text-slate-600 ml-1 flex items-center gap-1"><Calendar size={14} className="text-[#c29b7c]" /> 모임 유지 시간 (만료 설정)</label>
              <select 
                value={expireHours}
                onChange={(e) => setExpireHours(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs font-bold outline-none text-slate-600 focus:border-[#c29b7c]"
              >
                <option value="">계속 유지 (만료 없음)</option>
                <option value="1">1시간 동안 유지</option>
                <option value="3">3시간 동안 유지</option>
                <option value="12">12시간 동안 유지</option>
                <option value="24">24시간 동안 유지</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm rounded-2xl cursor-pointer transition-colors"
            >
              취소
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 bg-[#c29b7c] hover:bg-[#b08968] text-white font-black text-sm rounded-2xl cursor-pointer transition-all shadow-md shadow-orange-900/10 disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "핀 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}