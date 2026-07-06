// src/components/Navigation.jsx (전체 코드)
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext"; // 추가
import { PC_NAV_ITEMS, MOBILE_NAV_ITEMS, MENU_DETAILS } from "../constants/navItems";
import { Copy, Check, LogOut } from "lucide-react";

export default function Navigation({ isNavVisible, onNewPostClick }) {
  const location = useLocation();
  const { profile } = useAuth(); // AuthContext에서 최신 프로필 정보 구독
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const logoutRef = useRef(null);

  useEffect(() => { setIsMoreOpen(false); setIsLogoutOpen(false); }, [location.pathname]);

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
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[100px] xl:w-[220px] bg-[#f3f0e8] border-r border-slate-200/60 p-4 justify-between z-50">
        <div className="flex flex-col gap-3 items-center xl:items-start">
          <div className="py-3 px-2 hidden xl:block"><span className="font-extrabold text-xl text-slate-800 tracking-wider">우동집</span></div>
          {PC_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 w-full justify-center xl:justify-start cursor-pointer ${isActive ? "bg-slate-800 text-white font-bold" : "text-slate-600 hover:bg-slate-200/70"}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:inline text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={onNewPostClick} className="mt-4 w-12 h-12 xl:w-full xl:h-auto xl:py-3.5 bg-slate-800 text-white font-bold rounded-full shadow-md flex items-center justify-center text-sm cursor-pointer">
            <span className="xl:hidden text-xl">+</span><span className="hidden xl:inline">새 글 기록하기</span>
          </button>
        </div>

        <div className="w-full mb-2 relative" ref={logoutRef}>
          <div className="flex items-center p-2.5 rounded-full w-full justify-center xl:justify-start gap-3">
            <Link to={`/profile/${auth.currentUser?.uid}`} className="shrink-0">
              <img src={profile?.photoURL || auth.currentUser?.photoURL || "/default-avatar.png"} className="w-9 h-9 rounded-full bg-slate-300 object-cover ring-2 ring-white/40" alt="프로필" />
            </Link>
            <div className="hidden xl:flex flex-col min-w-0 flex-1 items-start justify-center">
              <Link to={`/profile/${auth.currentUser?.uid}`} className="font-bold text-xs text-slate-800 truncate block leading-tight mb-0.5">{profile?.displayName || "집사"}</Link>
              <button onClick={handleCopyUid} className="text-left text-[10px] text-slate-500 truncate flex items-center gap-1 cursor-pointer w-full">
                @{profile?.user_handle || auth.currentUser?.uid.slice(0, 8)}
                {isCopied ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-slate-400" />}
              </button>
            </div>
            <button onClick={() => setIsLogoutOpen(!isLogoutOpen)} className="hidden xl:block ml-auto text-slate-400 hover:text-slate-600 font-bold text-xs px-1 cursor-pointer">···</button>
          </div>
          {isLogoutOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 z-50">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer">
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}