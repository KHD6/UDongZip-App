import React, { useRef, useEffect, useState } from "react";

function PostCard({ nickname, content, mediaList, onOpenViewer, initialIndex, onUpdateIndex, isPlaying, onVisibilityChange, onHoverStateChange }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const hasMedia = mediaList && mediaList.length > 0;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) onVisibilityChange(true); });
    }, { threshold: 0.6 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [onVisibilityChange]);

  useEffect(() => {
    setCurrentIndex(initialIndex || 0);
    if (containerRef.current) containerRef.current.scrollLeft = containerRef.current.clientWidth * (initialIndex || 0);
  }, [initialIndex]);

  useEffect(() => {
    if (!hasMedia) return;
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (isPlaying && idx === currentIndex) video.play().catch(() => {});
      else { video.pause(); video.currentTime = 0; }
    });
  }, [isPlaying, currentIndex, hasMedia]);

  const handleNav = (newIdx) => {
    if (newIdx < 0 || newIdx >= mediaList.length) return;
    setCurrentIndex(newIdx);
    onUpdateIndex(newIdx);
    if (containerRef.current) containerRef.current.scrollLeft = containerRef.current.clientWidth * newIdx;
  };

  return (
    <article ref={cardRef} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgba(230,210,210,0.2)]"
             onMouseEnter={() => onHoverStateChange(true)} onMouseLeave={() => onHoverStateChange(false)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
        <span className="font-bold text-slate-700">{nickname}</span>
      </div>
      
      {hasMedia && (
        <div className="aspect-video bg-slate-50 rounded-2xl relative group overflow-hidden mb-4">
          {/* 인덱스 표시 배지 (복구 완료: 1/4 형태) */}
          <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {mediaList.length}
          </div>

          <div ref={containerRef} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {mediaList.map((item, idx) => (
              <div key={idx} className="w-full h-full shrink-0 snap-center relative cursor-pointer" onClick={() => onOpenViewer(idx)}>
                {item.type === "video" ? (
                  <video ref={el => videoRefs.current[idx] = el} src={item.url} muted loop playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="" />
                )}
              </div>
            ))}
          </div>

          {currentIndex > 0 && (
            <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10" onClick={(e) => { e.stopPropagation(); handleNav(currentIndex - 1); }}>〈</button>
          )}
          {currentIndex < mediaList.length - 1 && (
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10" onClick={(e) => { e.stopPropagation(); handleNav(currentIndex + 1); }}>〉</button>
          )}
        </div>
      )}
      
      <div className="text-slate-600 leading-relaxed whitespace-pre-line">{content}</div>
    </article>
  );
}
export default React.memo(PostCard);