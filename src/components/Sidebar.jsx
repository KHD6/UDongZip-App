import React from "react";
import { useAuth } from "../context/AuthContext";

function Sidebar({ onOpenModal }) { // onOpenModal 다시 추가
  const { logout } = useAuth();

  return (
    <aside className="w-full md:w-64 p-6 border-r border-slate-200 sticky top-0 md:h-screen flex flex-row md:flex-col justify-between items-center md:items-start">
      <h1 className="text-2xl font-bold text-slate-700 tracking-tight">
        우동집
      </h1>

      {/* 데스크탑에서만 보이는 버튼 */}
      <button
        onClick={onOpenModal}
        className="hidden md:block w-full bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition"
      >
        새 기록
      </button>

      <button
        onClick={logout}
        className="text-slate-500 hover:text-red-500 text-sm transition"
      >
        로그아웃
      </button>
    </aside>
  );
}
export default Sidebar;