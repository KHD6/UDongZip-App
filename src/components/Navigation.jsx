import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { PC_NAV_ITEMS, MOBILE_NAV_ITEMS, MENU_DETAILS } from "../constants/navItems";

export default function Navigation({ isNavVisible, onNewPostClick }) {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* =========================================================================
          [모바일 전용] 상단 헤더 바
         ========================================================================= */}
      <header 
        className={`fixed top-0 left-0 w-full h-[52px] bg-white border-b border-slate-100 z-50 flex items-center justify-between px-4 transition-transform duration-300 md:hidden ${
          isNavVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link to={`/profile/${auth.currentUser?.uid}`} className="flex items-center">
          <img 
            src={auth.currentUser?.photoURL || "/default-avatar.png"} 
            className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
            alt="내 프로필" 
          />
        </Link>
        <span className="font-bold text-base text-slate-800 tracking-tight">우동집</span>
        <button className="text-xl p-1 hover:bg-slate-50 rounded-full transition-colors">🔔</button>
      </header>

      {/* =========================================================================
          [데스크탑 전용] 좌측 사이드바
         ========================================================================= */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[100px] xl:w-[220px] bg-[#f3f0e8] border-r border-slate-200/60 p-4 justify-between transition-all duration-300 z-50">
        <div className="flex flex-col gap-3 items-center xl:items-start">
          <div className="py-3 px-2 hidden xl:block">
            <span className="font-extrabold text-xl text-slate-800 tracking-wider">우동집</span>
          </div>

          {PC_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 w-full justify-center xl:justify-start ${
                  isActive 
                    ? "bg-slate-800 text-white font-bold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:inline text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          <button
            onClick={onNewPostClick}
            className="mt-4 w-12 h-12 xl:w-full xl:h-auto xl:py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full shadow-md transition-all duration-200 flex items-center justify-center text-sm"
          >
            <span className="xl:hidden text-xl">+</span>
            <span className="hidden xl:inline">새 글 기록하기</span>
          </button>
        </div>

        <Link 
          to={`/profile/${auth.currentUser?.uid}`} 
          className={`flex items-center gap-3 p-2.5 hover:bg-slate-200/70 rounded-full transition-all duration-200 w-full justify-center xl:justify-start mb-2 ${
            location.pathname === `/profile/${auth.currentUser?.uid}` ? "bg-slate-300/50" : ""
          }`}
        >
          <img 
            src={auth.currentUser?.photoURL || "/default-avatar.png"} 
            className="w-9 h-9 rounded-full bg-slate-300 object-cover ring-2 ring-white/40" 
            alt="프로필" 
          />
          <div className="hidden xl:flex flex-col min-w-0 flex-1">
            <span className="font-bold text-xs text-slate-800 truncate">{auth.currentUser?.displayName || "집사"}</span>
            <span className="text-[10px] text-slate-500 truncate">@{auth.currentUser?.uid.slice(0, 8)}</span>
          </div>
          <button className="hidden xl:block ml-auto text-slate-400 hover:text-slate-600 font-bold tracking-widest text-xs px-1">···</button>
        </Link>
      </nav>

      {/* =========================================================================
          [모바일 전용] 하단 내비게이션 바 & 더보기 레이어
         ========================================================================= */}
      
      {/* 더보기 팝업 레이어 (하단바에 프로필이 독립 분리되었으므로 설정 진입점만 유지) */}
      {isMoreOpen && (
        <div className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-[60] md:hidden flex flex-col gap-1 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4">
          <Link
            to={MENU_DETAILS.settings.path}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              location.pathname === MENU_DETAILS.settings.path ? "bg-slate-100 font-bold" : "hover:bg-slate-50"
            }`}
          >
            <MENU_DETAILS.settings.icon size={18} className="text-slate-600" />
            <span className="text-sm text-slate-700">{MENU_DETAILS.settings.label}</span>
          </Link>
        </div>
      )}

      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-black/10 z-50 md:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* 모바일 5탭 하단 바 */}
      <div 
        className={`fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-100 z-50 flex items-center justify-around px-2 transition-transform duration-300 md:hidden ${
          isNavVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {MOBILE_NAV_ITEMS.map((item) => {
          const isMoreButton = item.label === "더보기";
          
          const targetPath = item.path === "/profile" 
            ? `/profile/${auth.currentUser?.uid}` 
            : item.path;
            
          const isActive = isMoreButton ? isMoreOpen : location.pathname === targetPath;

          if (isMoreButton) {
            return (
              <button
                key={item.label}
                onClick={() => setIsMoreOpen((prev) => !prev)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 transition-colors ${
                  isActive ? "text-slate-900 font-bold" : "text-slate-400"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] mt-1">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={targetPath}
              className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 transition-colors ${
                isActive ? "text-slate-900 font-bold" : "text-slate-400"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}