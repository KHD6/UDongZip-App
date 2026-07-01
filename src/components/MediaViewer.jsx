import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import VolumeControl from "./VolumeControl";
import { Maximize2, Minimize2 } from "lucide-react";

function MediaViewer({ mediaList, initialIndex = 0, onClose, volume, onVolumeChange }) {
  const videoRef = useRef(null);
  const viewerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 🌟 [추가된 기능] 뒷배경(타임라인) 스크롤 방지 로직 (Body Scroll Lock)
  useEffect(() => {
    // 뷰어가 열릴 때 기존 body의 overflow 스타일을 기억해두고, hidden으로 변경하여 스크롤 차단
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // 뷰어가 완전히 닫힐 때(Unmount) 원래 스크롤 상태로 안전하게 복구 (클린업 함수)
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // 모바일 환경 체크
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 볼륨 조절 함수
  const updateVolume = (newVolume) => {
    const fixedVol = Math.max(0, Math.min(1, parseFloat(newVolume.toFixed(1))));
    if (onVolumeChange) onVolumeChange(fixedVol);
    if (videoRef.current) videoRef.current.volume = fixedVol;
  };

  // Fullscreen API 처리 함수
  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (viewerRef.current.requestFullscreen) {
          await viewerRef.current.requestFullscreen();
        } else if (viewerRef.current.webkitRequestFullscreen) {
          await viewerRef.current.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
      }
    } catch (error) {
      console.error("전체화면 전환 실패:", error);
    }
  };

  // 브라우저 자체 전체화면 변경 이벤트 감지
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 바깥 영역 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      if (document.fullscreenElement) document.exitFullscreen();
      onClose(currentIndex);
    }
  };

  // 닫기 버튼 클릭 시 안전하게 전체화면 풀고 닫기
  const handleCloseClick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    onClose(currentIndex);
  };

  // 키보드 단축키 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(c => c - 1);
      if (e.key === "ArrowRight" && currentIndex < mediaList.length - 1) setCurrentIndex(c => c + 1);
      if (e.key === "ArrowUp") updateVolume(volume + 0.1);
      if (e.key === "ArrowDown") updateVolume(volume - 0.1);
      if (e.key === "Escape") handleCloseClick();
      if (e.key === " ") {
        if (videoRef.current) {
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose, mediaList.length, volume, onVolumeChange]);

  if (!mediaList || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];

  return ReactDOM.createPortal(
    <div 
      ref={viewerRef} 
      className="fixed inset-0 bg-black md:bg-slate-100/50 md:backdrop-blur-xl z-[9999] flex items-center justify-center select-none"
      onClick={handleOverlayClick} 
    >
      {/* 우측 상단 기능 버튼 모음 */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-[10005]">
        <button 
          onClick={toggleFullscreen} 
          className="bg-white/50 hover:bg-white p-2 rounded-full text-slate-800 transition-colors shadow-sm"
          title="전체화면"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button 
          onClick={handleCloseClick} 
          className="bg-white/50 hover:bg-white px-3 py-2 rounded-full text-slate-800 font-bold transition-colors shadow-sm"
        >
          ✕
        </button>
      </div>
      
      {/* 이동 버튼들 */}
      {currentIndex > 0 && (
        <button onClick={() => setCurrentIndex(c => c - 1)} className="absolute left-6 z-[10005] bg-white/50 hover:bg-white p-4 rounded-full shadow-md transition-colors">〈</button>
      )}
      {currentIndex < mediaList.length - 1 && (
        <button onClick={() => setCurrentIndex(c => c + 1)} className="absolute right-6 z-[10005] bg-white/50 hover:bg-white p-4 rounded-full shadow-md transition-colors">〉</button>
      )}

      {/* 미디어 컨텐츠 영역 */}
      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
          {currentMedia.type === "video" ? (
            <video 
              key={currentMedia.url} 
              ref={videoRef} 
              src={currentMedia.url} 
              autoPlay 
              controls={true} 
              onLoadedData={() => {
                setIsLoading(false);
                if (videoRef.current) videoRef.current.volume = volume;
              }} 
              className="max-h-[85vh] max-w-[85vw] md:max-w-[80vw] object-contain" 
            />
          ) : (
            <img 
              src={currentMedia.url} 
              alt="media"
              className="max-h-[85vh] max-w-[85vw] md:max-w-[80vw] object-contain pointer-events-none" 
              onLoad={() => setIsLoading(false)} 
            />
          )}
        </div>
        
        {/* 데스크톱 전용 볼륨 컨트롤러 */}
        {currentMedia.type === "video" && (
          <div className={`${isMobile ? 'hidden' : 'hidden md:flex'}`}>
            <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
          </div>
        )}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
}

export default MediaViewer;