// src/components/BottomNav.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navigation"; // 🌟 동일한 메뉴 데이터 공유

function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-[80] shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${
              isActive ? "text-slate-900 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={22} className="mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;