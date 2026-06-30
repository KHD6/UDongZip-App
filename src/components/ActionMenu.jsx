// src/components/ActionMenu.jsx
import React, { useState, useEffect, useRef } from "react";

export default function ActionMenu({ onEdit, onDelete, onReport }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-slate-400 hover:text-slate-600 font-bold text-xl"
      >
        ⋮
      </button>
      
      {/* 절대 위치(absolute)를 사용하여 글 내용 밀림 방지 */}
      {isOpen && (
        <div className="absolute right-0 top-6 w-28 bg-white border border-slate-100 rounded-xl shadow-lg z-[1001] text-sm py-1">
          {onEdit && <button onClick={() => { onEdit(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-slate-50">수정</button>}
          {onDelete && <button onClick={() => { onDelete(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-red-500 hover:bg-slate-50">삭제</button>}
          {onReport && <button onClick={() => { onReport(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 hover:bg-slate-50">신고하기</button>}
        </div>
      )}
    </div>
  );
}