import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { PC_NAV_ITEMS, MOBILE_NAV_ITEMS, MENU_DETAILS } from "../constants/navItems";
import { Copy, Check } from "lucide-react";

export default function Navigation({ isNavVisible, onNewPostClick }) {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  const handleCopyUid = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.currentUser?.uid) return;
    
    try {
      await navigator.clipboard.writeText(auth.currentUser.uid);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("UID 복사 실패:", err);
    }
  };

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

        {/* 
          [PC 하단 프로필 카드 영역]
          - 툴팁 트리거를 최외각 div에서 UID 복사 버튼 내부(group/uid)로 하향 이동 조정
        */}
        <div className="w-full mb-2">
          <div className="flex items-center p-2.5 hover:bg-slate-200/50 rounded-full transition-all duration-200 w-full justify-center xl:justify-start gap-3">
            
            {/* 1. 프로필 이미지 Link */}
            <Link 
              to={`/profile/${auth.currentUser?.uid}`}
              className="shrink-0 flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={auth.currentUser?.photoURL || "/default-avatar.png"} 
                className="w-9 h-9 rounded-full bg-slate-300 object-cover ring-2 ring-white/40" 
                alt="프로필" 
              />
            </Link>

            {/* 2. 닉네임 정보 및 고도화된 UID 복사 컨테이너 영역 */}
            <div className="hidden xl:flex flex-col min-w-0 flex-1 items-start justify-center">
              <Link 
                to={`/profile/${auth.currentUser?.uid}`}
                className="font-bold text-xs text-slate-800 truncate hover:underline block leading-tight mb-0.5"
              >
                {auth.currentUser?.displayName || "집사"}
              </Link>
              
              {/* 
                [UID 전용 트리거 영역 확장]
                - 오직 이 버튼 위에 마우스가 올라갔을 때만 내부 툴팁 레이어가 연동되도록 독립 제어
              */}
              <div className="relative group/uid min-w-0 w-full">
                <button 
                  onClick={handleCopyUid}
                  className="text-left text-[10px] text-slate-500 truncate hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer w-full"
                >
                  <span className="truncate">@{auth.currentUser?.uid.slice(0, 8)}</span>
                  {isCopied ? (
                    <Check size={10} className="text-green-600 inline-block shrink-0" />
                  ) : (
                    <Copy size={10} className="opacity-0 group-hover/uid:opacity-100 text-slate-400 inline-block shrink-0 transition-opacity" />
                  )}
                </button>

                {/* 
                  [정교화된 복사 안내 툴팁 마크업 - group/uid 연동]
                  - Tailwind CSS 가독성을 위한 레이아웃 줄바꿈 준수
                */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                  hidden xl:group-hover/uid:flex flex-col items-center pointer-events-none z-50">
                  <div className="bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-md whitespace-nowrap font-medium">
                    {isCopied ? "복사 완료! 🐾" : "클릭하면 전체 UID가 복사됩니다"}
                  </div>
                  <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-1"></div>
                </div>
              </div>
            </div>

            {/* 3. 더보기 액션 버튼 */}
            <button className="hidden xl:block ml-auto text-slate-400 hover:text-slate-600 font-bold tracking-widest text-xs px-1 cursor-pointer">···</button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          [모바일 전용] 하단 내비게이션 바 & 더보기 레이어
         ========================================================================= */}
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