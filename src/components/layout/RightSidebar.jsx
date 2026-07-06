// src/components/layout/RightSidebar.jsx
import React from 'react';

export default function RightSidebar() {
  return (
    <aside className="hidden lg:block w-72 p-6">
      <div className="bg-white p-6 rounded-[28px] border border-slate-50 shadow-[0_12px_40px_rgba(194,155,124,0.03)]">
        <h2 className="font-extrabold text-slate-800 mb-4 text-sm tracking-tight">실시간 인기 동네 태그</h2>
        <div className="space-y-3.5 text-xs text-slate-500 font-bold">
          <p className="hover:text-[#c29b7c] cursor-pointer transition-colors">#파스텔감성 🐾</p>
          <p className="hover:text-[#c29b7c] cursor-pointer transition-colors">#슈가글라이더_기록</p>
          <p className="hover:text-[#c29b7c] cursor-pointer transition-colors">#초보집사_가이드</p>
          <p className="hover:text-[#c29b7c] cursor-pointer transition-colors">#우리동네동물병원</p>
        </div>
      </div>
    </aside>
  );
}