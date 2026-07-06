import React, { useState } from "react";

export default function RelativeTime({ createdAt }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!createdAt) return null;

  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;

  let relativeTime = "";
  if (diff < 60) relativeTime = "방금 전";
  else if (diff < 3600) relativeTime = `${Math.floor(diff / 60)}분 전`;
  else if (diff < 86400) relativeTime = `${Math.floor(diff / 3600)}시간 전`;
  else if (diff < 604800) relativeTime = `${Math.floor(diff / 86400)}일 전`;
  else relativeTime = date.toLocaleDateString();

  const fullDate = date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="text-xs text-slate-400 cursor-default relative inline-block"
    >
      {relativeTime}

      {showTooltip && (
        <div className="absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-full z-[100] pointer-events-none">
          <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
            {fullDate}
            {/* 툴팁 꼬리 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </span>
  );
}