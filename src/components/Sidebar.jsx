import React from 'react';

function Sidebar({ onOpenModal }) {
  return (
    <aside className="hidden md:flex flex-col w-64 p-6 gap-6 sticky top-0 h-screen">
      <h1 className="text-2xl font-bold text-slate-700 tracking-tight text-center">우동집</h1>
      <button 
        onClick={onOpenModal}
        className="w-full bg-[#fae8ff] hover:bg-[#f5d0fe] text-slate-700 py-3 rounded-2xl font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
      >
        새 기록
      </button>
    </aside>
  );
}
export default Sidebar;