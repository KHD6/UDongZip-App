import React from "react";
import ActionMenu from "./ActionMenu";

export default function PostHeader({ nickname, photoURL, isOwner, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <img 
          src={photoURL || "/default-profile.png"} 
          className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200" 
          alt="profile" 
        />
        <span className="font-bold text-slate-700">{nickname}</span>
      </div>
      
      <ActionMenu 
        onEdit={isOwner ? onEdit : null} 
        onDelete={isOwner ? onDelete : null} 
        onReport={() => alert("신고되었습니다. (업데이트 예정)")} 
      />
    </div>
  );
}