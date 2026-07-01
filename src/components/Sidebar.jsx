import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navigation";

function Sidebar({ onNewPostClick }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="hidden md:flex flex-col w-64 h-screen sticky top-0 p-6 justify-between border-r border-slate-100 bg-white z-50">
      <div className="space-y-10">
        {/* 로고 */}
        <Link to="/" className="block text-2xl font-bold text-slate-800 tracking-wide px-3">
          우동집
        </Link>

        {/* 시맨틱 nav 영역 */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-950/10"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 🌟 새 기록 버튼 (cursor-pointer 추가) */}
        <button 
          onClick={onNewPostClick}
          className="w-full bg-[#1e293b] text-white py-3 rounded-xl font-medium shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
        >
          새 기록
        </button>
      </div>

      <div className="text-xs text-slate-300 px-4">© 2026 우동집</div>
    </div>
  );
}

export default Sidebar;