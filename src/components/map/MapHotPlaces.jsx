// src/components/map/MapHotPlaces.jsx
import React from "react";
import { Flame, MapPin } from "lucide-react";

export default function MapHotPlaces({ hotPlaces = [], onPlaceClick }) {
  // 샘플 데이터 바인딩 (실제 랭킹 데이터가 빈 배열일 때의 폴백)
  const displayPlaces = hotPlaces.length > 0 ? hotPlaces.slice(0, 3) : [
    { id: "sample1", title: "멍냥 다정 동물병원", category: "hospital", lat: 37.5665, lng: 126.9780 },
    { id: "sample2", title: "우동집 캣카페", category: "cafe", lat: 37.5655, lng: 126.9790 },
    { id: "sample3", title: "반려묘 집사 번개모임", category: "meetup", lat: 37.5675, lng: 126.9770 }
  ];

  const getEmoji = (idx) => {
    if (idx === 0) return "🥇";
    if (idx === 1) return "🥈";
    return "🥉";
  };

  return (
    <div className="absolute top-4 right-4 z-[400] w-64 bg-white/95 backdrop-blur-md p-4 rounded-[24px] border border-orange-100/50 shadow-[0_12px_40px_rgba(194,155,124,0.1)] hidden md:block">
      <div className="flex items-center gap-1.5 mb-3">
        <Flame size={16} className="text-orange-500 animate-pulse" />
        <h3 className="font-black text-xs text-slate-800 tracking-tight">이번 주 실시간 동네 핫플레이스</h3>
      </div>
      <div className="space-y-2">
        {displayPlaces.map((place, idx) => (
          <div 
            key={place.id}
            onClick={() => onPlaceClick(place)}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#fdfbf7] cursor-pointer transition-all border border-transparent hover:border-orange-50/50 group"
          >
            <span className="text-sm font-black">{getEmoji(idx)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-700 truncate group-hover:text-[#c29b7c] transition-colors">
                {place.title}
              </p>
              <p className="text-[10px] text-slate-400 font-bold capitalize">{place.category === 'hospital' ? '동물병원' : place.category === 'cafe' ? '펫카페' : '모임장소'}</p>
            </div>
            <MapPin size={12} className="text-[#c29b7c] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}