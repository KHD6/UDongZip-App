// src/components/Navigation.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { PC_NAV_ITEMS, MOBILE_NAV_ITEMS, MENU_DETAILS } from "../constants/navItems";
import { Copy, Check, LogOut } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function Navigation({ isNavVisible, onNewPostClick }) {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // 로그아웃 메뉴 상태
  const [isCopied, setIsCopied] = useState(false);
  const [userHandle, setUserHandle] = useState("");
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

  useEffect(() => {
    const fetchUserHandle = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserHandle(userDoc.data().user_handle || "");
        }
      } catch (err) {
        console.error("사용자 핸들 로드 실패:", err);
      }
    };
    fetchUserHandle();
  }, [location.pathname]);

  const handleCopyUid = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const copyText = userHandle ? `@${userHandle}` : auth.currentUser?.uid;
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) auth.signOut();
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full h-[52px] bg-white border-b border-slate-100 z-50 flex items-center justify-between px-4 transition-transform duration-300 md:hidden ${isNavVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <Link to={`/profile/${auth.currentUser?.uid}`} className="flex items-center cursor-pointer">
          <img src={auth.currentUser?.photoURL || "/default-avatar.png"} className="w-8 h-8 rounded-full bg-slate-200 object-cover" alt="내 프로필" />
        </Link>
        <span className="font-bold text-base text-slate-800 tracking-tight">우동집</span>
        <button className="text-xl p-1 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">🔔</button>
      </header>

      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[100px] xl:w-[220px] bg-[#f3f0e8] border-r border-slate-200/60 p-4 justify-between transition-all duration-300 z-50">
        <div className="flex flex-col gap-3 items-center xl:items-start">
          <div className="py-3 px-2 hidden xl:block"><span className="font-extrabold text-xl text-slate-800 tracking-wider">우동집</span></div>
          {PC_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 p-3 rounded-full transition-all duration-200 w-full justify-center xl:justify-start cursor-pointer ${isActive ? "bg-slate-800 text-white font-bold shadow-sm" : "text-slate-600 hover:bg-slate-200/70"}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden xl:inline text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
          <button onClick={onNewPostClick} className="mt-4 w-12 h-12 xl:w-full xl:h-auto xl:py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-full shadow-md transition-all duration-200 flex items-center justify-center text-sm cursor-pointer">
            <span className="xl:hidden text-xl">+</span>
            <span className="hidden xl:inline">새 글 기록하기</span>
          </button>
        </div>

        <div className="w-full mb-2 relative" ref={logoutRef}>
          <div className="flex items-center p-2.5 hover:bg-slate-200/50 rounded-full transition-all duration-200 w-full justify-center xl:justify-start gap-3">
            <Link to={`/profile/${auth.currentUser?.uid}`} className="shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <img src={auth.currentUser?.photoURL || "/default-avatar.png"} className="w-9 h-9 rounded-full bg-slate-300 object-cover ring-2 ring-white/40" alt="프로필" />
            </Link>
            <div className="hidden xl:flex flex-col min-w-0 flex-1 items-start justify-center">
              <Link to={`/profile/${auth.currentUser?.uid}`} className="font-bold text-xs text-slate-800 truncate hover:underline block leading-tight mb-0.5">{auth.currentUser?.displayName || "집사"}</Link>
              <button onClick={handleCopyUid} className="text-left text-[10px] text-slate-500 truncate hover:text-slate-900 flex items-center gap-1 cursor-pointer w-full">
                {userHandle ? `@${userHandle}` : `@${auth.currentUser?.uid.slice(0, 8)}`}
                {isCopied ? <Check size={10} className="text-green-600" /> : <Copy size={10} className="text-slate-400" />}
              </button>
            </div>
            <button onClick={() => setIsLogoutOpen(!isLogoutOpen)} className="hidden xl:block ml-auto text-slate-400 hover:text-slate-600 font-bold text-xs px-1 cursor-pointer">···</button>
          </div>

          {/* 로그아웃 메뉴 */}
          {isLogoutOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold cursor-pointer">
                <LogOut size={14} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* 모바일 하단바 */}
      <div className={`fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-100 z-50 flex items-center justify-around px-2 transition-transform duration-300 md:hidden ${isNavVisible ? "translate-y-0" : "translate-y-full"}`}>
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