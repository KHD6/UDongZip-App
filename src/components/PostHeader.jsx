import React from "react";
import { Link } from "react-router-dom";
import ActionMenu from "./ActionMenu";

export default function PostHeader({ nickname, photoURL, isOwner, onDelete, onEdit, uid, user_handle }) {
  const profilePath = `/profile/${uid}`;

  return (
    <div className="flex items-center justify-between mb-4">
      {/* 
        프로필 사진, 닉네임, 고유 식별자를 Link 컴포넌트로 통합 래핑 
        Tailwind CSS 가독성을 위한 인라인 줄바꿈 처리
      */}
      <Link 
        to={profilePath} 
        className="flex items-center gap-3 group cursor-pointer min-w-0"
      >
        <img 
          src={photoURL || "/default-profile.png"} 
          className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200/60 group-hover:opacity-85 transition-opacity" 
          alt={`${nickname} 프로필`} 
        />
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-bold text-slate-700 text-sm tracking-tight group-hover:underline truncate">
            {nickname}
          </span>
          {user_handle && (
            <span className="text-xs text-slate-400 font-normal tracking-tight truncate">
              @{user_handle}
            </span>
          )}
        </div>
      </Link>
      
      <ActionMenu 
        onEdit={isOwner ? onEdit : null} 
        onDelete={isOwner ? onDelete : null} 
        onReport={() => alert("신고되었습니다. (업데이트 예정)")} 
      />
    </div>
  );
}