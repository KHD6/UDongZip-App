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

  // !!추가된 내용!!: currentIndex가 변할 때마다 스크롤 위치 이동
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
        <div className="aspect-video bg-slate-50 rounded-2xl relative group overflow-hidden mb-4">
          
          {/* !!추가된 내용!!: 1/4 표시 인디케이터 */}
          <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {mediaList.length}
          </div>

          {/* !!추가된 내용!!: 좌우 화살표 버튼 */}
          {mediaList.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button 
                  onClick={handlePrev} 
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                >◀</button>
              )}
              {currentIndex < mediaList.length - 1 && (
                <button 
                  onClick={handleNext} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow hover:bg-white"
                >▶</button>
              )}
            </>
          )}

          {/* //!??수정되기전 삭제된 내용??!: 중복되던 두 번째 map 블록 삭제됨 */}
          <div
            ref={scrollContainerRef}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
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
      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}