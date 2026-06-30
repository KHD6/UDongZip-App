import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

export default function RelativeTime({ createdAt }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);

  if (!createdAt) return null;

  // Firebase Timestamp 객체인지 확인하는 로직
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);

  // Date 객체 변환 실패 시 예외 처리
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

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY - 8, // 툴팁 위쪽 여백
        left: rect.left + window.scrollX + rect.width / 2,
      });
      setShowTooltip(true);
    }
  };

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-xs text-slate-400 cursor-default"
      >
        {relativeTime}
      </span>

      {/* Portal을 사용하여 모달 밖(body)으로 툴팁 렌더링 */}
      {showTooltip &&
        createPortal(
          <div
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
              {fullDate}
              {/* 말풍선 꼬리 */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}