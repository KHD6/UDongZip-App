// src/components/layout/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { PC_NAV_ITEMS, MOBILE_NAV_ITEMS, MENU_DETAILS } from "../../constants/navItems";
import { Copy, Check, LogOut } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function Navigation({ isNavVisible, onNewPostClick }) {
  const location = useLocation();
  const { profile } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const logoutRef = useRef(null);

  useEffect(() => {
    setIsMoreOpen(false);
    setIsLogoutOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (logoutRef.current && !logoutRef.current.contains(e.target)) setIsLogoutOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyUid = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const handle = profile?.user_handle || auth.currentUser?.uid.slice(0, 8);
    try {
      await navigator.clipboard.writeText(`@${handle}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => { if (window.confirm("로그아웃 하시겠습니까?")) auth.signOut(); };

  return (
    <>
      {/* 모바일 상단 바 */}
      <header className={`fixed top-0 left-0 w-full h-[52px] bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 flex items-center justify-between px-4 transition-transform duration-300 md:hidden ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <Link to={`/profile/${auth.currentUser?.uid}`} className="flex items-center cursor-pointer">
          <img src={profile?.photoURL || auth.currentUser?.photoURL || "/default-avatar.png"} className="w-8 h-8 rounded-full bg-slate-200 object-cover" alt="내 프로필" />
        </Link>
        <span className="font-black text-base text-slate-800 tracking-tight">우동집</span>
        <button className="text-xl p-1 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">🔔</button>
      </header>

      {/* 데스크탑 좌측 사이드바 */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[100px] xl:w-[220px] bg-[#f3f0e8]/80 backdrop-blur-md border-r border-slate-200/60 p-4 justify-between transition-all duration-300 z-50">
        <div className="flex flex-col gap-3 items-center xl:items-start">
          <div className="py-4 px-2 hidden xl:block">
            <span className="font-black text-xl text-slate-800 tracking-wide">🐾 우동집</span>
          </div>

          {PC_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 p-3.5 rounded-[20px] transition-all duration-200 w-full justify-center xl:justify-start cursor-pointer ${isActive ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-600 hover:bg-slate-200/70"}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:inline text-sm font-bold">{item.label}</span>
              </Link>
            );
          })}

          <button onClick={onNewPostClick} className="mt-4 w-12 h-12 xl:w-full xl:h-auto xl:py-4 bg-[#c29b7c] hover:bg-[#b08968] text-white font-black rounded-[20px] shadow-md shadow-orange-900/10 transition-all flex items-center justify-center text-sm cursor-pointer active:scale-95">
            <span className="xl:hidden text-xl">+</span>
            <span className="hidden xl:inline">새 글 기록하기</span>
          </button>
        </div>

        {/* 내 프로필 카드 */}
        <div className="w-full mb-2 relative" ref={logoutRef}>
          <div className="flex items-center p-2 hover:bg-slate-200/50 rounded-2xl transition-all duration-200 w-full justify-center xl:justify-start gap-3">
            <Link to={`/profile/${auth.currentUser?.uid}`} className="shrink-0 cursor-pointer">
              <img src={profile?.photoURL || auth.currentUser?.photoURL || "/default-avatar.png"} className="w-9 h-9 rounded-full bg-slate-300 object-cover ring-2 ring-white" alt="프로필" />
            </Link>
            <div className="hidden xl:flex flex-col min-w-0 flex-1 items-start justify-center">
              <Link to={`/profile/${auth.currentUser?.uid}`} className="font-extrabold text-xs text-slate-800 truncate block leading-tight mb-0.5 hover:underline cursor-pointer">{profile?.displayName || "집사"}</Link>
              <button onClick={handleCopyUid} className="text-left text-[10px] text-slate-500 truncate flex items-center gap-1 cursor-pointer w-full font-bold">
                @{profile?.user_handle || auth.currentUser?.uid.slice(0, 8)}
                {isCopied ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-slate-400" />}
              </button>
            </div>
            <button onClick={() => setIsLogoutOpen(!isLogoutOpen)} className="hidden xl:block ml-auto text-slate-400 hover:text-slate-600 font-bold text-xs px-1 cursor-pointer">···</button>
          </div>
          {isLogoutOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-2xl shadow-xl border border-slate-100/80 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full p-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-black cursor-pointer transition-colors">
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 모바일 하단 바 */}
      <div className={`fixed bottom-0 left-0 w-full h-16 bg-white/95 backdrop-blur-md border-t border-slate-100 z-50 flex items-center justify-around px-2 transition-transform duration-300 md:hidden ${isNavVisible ? "translate-y-0" : "translate-y-full"}`}>
        {MOBILE_NAV_ITEMS.map((item) => {
          const isMoreButton = item.label === "더보기";
          const targetPath = item.path === "/profile" ? `/profile/${auth.currentUser?.uid}` : item.path;
          const isActive = isMoreButton ? isMoreOpen : location.pathname === targetPath;
          return (
            <button key={item.label} onClick={() => isMoreButton ? setIsMoreOpen(!isMoreOpen) : null} className={`flex flex-col items-center justify-center p-2 rounded-xl flex-1 cursor-pointer ${isActive ? "text-slate-900 font-bold" : "text-slate-400"}`}>
              {!isMoreButton ? <Link to={targetPath} className="flex flex-col items-center"><item.icon size={20} /><span className="text-[10px] mt-1">{item.label}</span></Link> : <><item.icon size={20} /><span className="text-[10px] mt-1">{item.label}</span></>}
            </button>
          );
        })}
      </div>
    </>
  );
}