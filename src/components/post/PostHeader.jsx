// src/components/post/PostHeader.jsx
import React from "react";
import { Link } from "react-router-dom";
import ActionMenu from "./ActionMenu";

export default function PostHeader({ nickname, photoURL, isOwner, onDelete, onEdit, uid, user_handle }) {
  const profilePath = `/profile/${uid}`;

  return (
    <div className="flex items-center justify-between mb-4">
      <Link 
        to={profilePath} 
        className="flex items-center gap-3 group cursor-pointer min-w-0"
      >
        <img 
          src={photoURL || "/default-profile.png"} 
          className="w-10 h-10 rounded-full bg-slate-50 object-cover border-2 border-white shadow-sm group-hover:opacity-90 transition-opacity" 
          alt={`${nickname} 프로필`} 
        />
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-extrabold text-slate-800 text-sm tracking-tight group-hover:text-[#c29b7c] transition-colors truncate">
            {nickname}
          </span>
          {user_handle && (
            <span className="text-[10px] text-slate-400 font-bold tracking-tight truncate">
              @{user_handle}
            </span>
          )}
        </div>
      </Link>
      
      <ActionMenu 
        onEdit={isOwner ? onEdit : null} 
        onDelete={isOwner ? onDelete : null} 
        onReport={() => alert("신고되었습니다. 신속히 검토하겠습니다. 🐾")} 
      />
    </div>
  );
}