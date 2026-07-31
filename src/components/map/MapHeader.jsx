// src/components/map/MapHeader.jsx
import React from "react";
import { ArrowLeft, Search, HeartPulse, Store, Users, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MapHeader({ 
  searchQuery, 
  setSearchQuery, 
  activeCategory, 
  setActiveCategory, 
  onMyLocationClick 
}) {
  const navigate = useNavigate();

  const categories = [
    { id: "all", label: "전체", icon: Compass },
    { id: "hospital", label: "동물병원", icon: HeartPulse },
    { id: "cafe", label: "펫카페/용품", icon: Store },
    { id: "meetup", label: "모임장소", icon: Users },
  ];

  return (
    <div className="w-full bg-[#fdfbf7] p-4 md:p-6 border-b border-orange-100/50 flex flex-col gap-4 flex-shrink-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* 뒤로가기 및 제목 */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/")} 
            className="p-2.5 bg-white hover:bg-slate-50 rounded-full transition-all border border-slate-100 shadow-sm cursor-pointer"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="font-black text-slate-800 text-base md:text-lg tracking-tight flex items-center gap-1.5">
              동네 지도 및 교류
            </h1>
            <p className="text-[10px] text-slate-400 font-bold hidden sm:block">원하는 지점을 클릭해 장소를 공유해 보세요!</p>
          </div>
        </div>

        {/* 검색창 */}
        <div className="flex-1 max-w-[280px] relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c29b7c] transition-colors" size={16} />
          <input 
            type="text"
            placeholder="장소 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#c29b7c] focus:ring-1 focus:ring-[#c29b7c]/10 shadow-sm transition-all"
          />
        </div>

        {/* 내 위치 버튼 */}
        <button 
          onClick={onMyLocationClick}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-full text-slate-600 shadow-sm transition-all cursor-pointer flex items-center justify-center active:scale-95"
          title="내 위치 찾기"
        >
          <Compass size={18} className="text-[#c29b7c] animate-spin-slow" />
        </button>
      </div>

      {/* 카테고리 필터 캡슐 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer border flex-shrink-0 ${
                isActive 
                  ? "bg-[#c29b7c] text-white border-[#c29b7c] shadow-md shadow-orange-900/10" 
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}