import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { NAV_ITEMS } from "../constants/navItems";

export default function Navigation() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* 모바일 상단 바 */}
      <header 
        className={`fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b z-[900] transition-transform duration-300 sm:hidden ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link to={`/profile/${auth.currentUser?.uid}`}>
            <img src={auth.currentUser?.photoURL || "/default-avatar.png"} className="w-8 h-8 rounded-full bg-slate-200" alt="프로필" />
          </Link>
          <span className="font-bold text-lg">우동집</span>
          <button>🔔</button>
        </div>
      </header>

      {/* 데스크탑 사이드바 */}
      <nav className="hidden sm:flex flex-col fixed left-0 h-full w-[250px] border-r p-4 justify-between bg-white z-[900]">
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const targetPath = item.path === "/profile" 
              ? `/profile/${auth.currentUser?.uid}` 
              : item.path;
            
            return (
              <Link 
                key={item.path} 
                to={targetPath}
                className="flex items-center gap-4 p-3 hover:bg-slate-100 rounded-full transition-colors"
              >
                <item.icon size={24} />
                <span className="hidden xl:inline font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        {/* 사이드바 하단 프로필 */}
        <Link to={`/profile/${auth.currentUser?.uid}`} className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-full transition-colors mb-4">
          <img src={auth.currentUser?.photoURL || "/default-avatar.png"} className="w-10 h-10 rounded-full bg-slate-200" alt="프로필" />
          <div className="hidden xl:flex flex-col">
            <span className="font-bold text-sm">{auth.currentUser?.displayName || "사용자"}</span>
            <span className="text-xs text-slate-500">@{auth.currentUser?.uid.slice(0, 8)}</span>
          </div>
          <button className="hidden xl:block ml-auto font-bold text-xl">···</button>
        </Link>
      </nav>
    </>
  );
}