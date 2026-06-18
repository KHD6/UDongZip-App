import React, { useRef, useEffect, useState } from "react";

function PostCard({ nickname, content, mediaList, onOpenViewer, initialIndex, onUpdateIndex, isPlaying, onVisibilityChange, onHoverStateChange }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const hasMedia = mediaList && mediaList.length > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onVisibilityChange(true);
        });
      },
      { threshold: 0.6 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [onVisibilityChange]);

  useEffect(() => {
    if (containerRef.current) {
      const targetIndex = initialIndex || 0;
      setCurrentIndex(targetIndex);
      requestAnimationFrame(() => {
        if (containerRef.current) containerRef.current.scrollLeft = containerRef.current.clientWidth * targetIndex;
      });
    }
  }, [initialIndex]);

  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (isPlaying && idx === currentIndex) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {}).catch(() => {
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          video.pause();
          if (video.currentTime !== 0) video.currentTime = 0;
        }
      }
    });
  }, [isPlaying, currentIndex]);

  return (
    <article
      ref={cardRef}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 relative overflow-hidden"
      onMouseEnter={() => onHoverStateChange(true)} // PC: 마우스 진입 시 재생 권한 획득
      onMouseLeave={() => onHoverStateChange(false)} // PC: 마우스 이탈 시 재생 중지
    >
      <div className="p-4 font-bold text-slate-800">{nickname}</div>

{hasMedia && (
        <div className="aspect-video bg-black relative group">
          {/* 인디케이터 추가 */}
          {mediaList.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10 pointer-events-none">
              {currentIndex + 1} / {mediaList.length}
            </div>
          )}

          <div
            ref={containerRef}
            className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-hide overscroll-x-contain"
          >
            {mediaList.map((item, idx) => (
              <div
                key={`${item.url}-${idx}`}
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
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={item.url} className="w-full h-full object-cover" alt="media" />
                )}
              </div>
            ))}
          </div>

          {/* 좌우 버튼 부분 유지 */}
          {mediaList.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIdx = currentIndex - 1;
                    setCurrentIndex(newIdx);
                    onUpdateIndex(newIdx);
                    if (containerRef.current) {
                      containerRef.current.scrollLeft = containerRef.current.clientWidth * newIdx;
                    }
                  }}
                >
                  〈
                </button>
              )}
              {currentIndex < mediaList.length - 1 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIdx = currentIndex + 1;
                    setCurrentIndex(newIdx);
                    onUpdateIndex(newIdx);
                    if (containerRef.current) {
                      containerRef.current.scrollLeft = containerRef.current.clientWidth * newIdx;
                    }
                  }}
                >
                  〉
                </button>
              )}
            </>
          )}
        </div>
      )}

      <div className="p-4 text-slate-700 break-words">{content}</div>
    </article>
  );
}

export default React.memo(PostCard);