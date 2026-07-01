// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../constants/navigation";

function Sidebar({ onNewPostClick }) {
  return (
    // w-full을 추가하여 사이드바가 전체 너비를 갖게 하고, items-center로 내부 아이콘/버튼 정렬
    <div className="flex flex-col h-screen sticky top-0 px-2 py-4 items-center w-full">
      {/* 로고 영역 */}
      <div className="p-3 mb-4">🐾</div>

      <nav className="flex flex-col items-center xl:items-start gap-2 w-full px-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex p-3 w-full justify-center xl:justify-start hover:bg-slate-100 rounded-full"
          >
            <item.icon size={26} />
            <span className="hidden xl:inline ml-4">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* 새 기록 버튼: w-full을 기준으로 크기 조절 */}
      <div className="mt-6 w-full flex justify-center px-2">
        <button
          onClick={onNewPostClick}
          className="w-12 h-12 xl:w-48 xl:h-12 bg-[#1a2333] text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer"
        >
          <span className="xl:hidden text-2xl font-bold">+</span>
          <span className="hidden xl:inline font-semibold">새 기록</span>
        </button>
      </div>
    </div>
  );
}
export default Sidebar;
