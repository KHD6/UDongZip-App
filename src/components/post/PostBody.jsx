// src/components/post/PostBody.jsx
import React, { useEffect, useRef } from "react";

export default function PostBody({
  content,
  mediaList,
  currentIndex,
  onOpenViewer,
  videoRefs,
  onUpdateIndex,
}) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.offsetWidth * currentIndex;
      container.scrollTo({ left: scrollAmount, behavior: "smooth" });
    }
  }, [currentIndex]);

  const handleNext = (e) => {
    e.stopPropagation();
    onUpdateIndex(Math.min(currentIndex + 1, mediaList.length - 1));
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    onUpdateIndex(Math.max(currentIndex - 1, 0));
  };

  return (
    <div className="mb-4">
      {mediaList?.length > 0 && (
        <div className="aspect-video bg-slate-50/50 rounded-[24px] border border-slate-100/50 relative group overflow-hidden mb-4 shadow-inner">
          {/* 캡슐형 인디케이터 */}
          <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
            {currentIndex + 1} / {mediaList.length}
          </div>

          {/* 슬라이드 화살표 */}
          {mediaList.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button 
                  onClick={handlePrev} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white p-2 rounded-full shadow-md transition-all cursor-pointer text-slate-700 text-xs font-black"
                >〈</button>
              )}
              {currentIndex < mediaList.length - 1 && (
                <button 
                  onClick={handleNext} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white p-2 rounded-full shadow-md transition-all cursor-pointer text-slate-700 text-xs font-black"
                >〉</button>
              )}
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mediaList.map((item, idx) => (
              <div
                key={idx}
                className="w-full h-full shrink-0 snap-center relative cursor-pointer"
                onClick={() => onOpenViewer(idx)}
              >
                {item.type === "video" ? (
                  <video
                    ref={(el) => (videoRefs.current[idx] = el)}
                    src={item.url}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line px-1">
        {content}
      </p>
    </div>
  );
}