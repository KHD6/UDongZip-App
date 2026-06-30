import React from "react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ onOpenModal }) {
  const { logout } = useAuth();

  return (
    <aside className="w-full md:w-64 p-6 border-r border-slate-200 sticky top-0 md:h-screen flex flex-col justify-between">
      {/* 상단: 로고와 새 기록 버튼 */}
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-700 tracking-tight text-center">
          우동집
        </h1>
        <button
          onClick={onOpenModal}
          className="w-full bg-[#fae8ff] hover:bg-[#f5d0fe] text-slate-700 py-3 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
        >
          새 기록
        </button>
      </div>
      <button
        onClick={logout}
        className="text-slate-500 hover:text-red-500 text-sm transition mt-auto md:mb-6"
      >
        로그아웃(임시)
      </button>
    </aside>
  );
}
export default Sidebar;