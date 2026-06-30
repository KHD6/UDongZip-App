import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import VolumeControl from "./VolumeControl";

function MediaViewer({ mediaList, initialIndex = 0, onClose, volume, onVolumeChange }) {
  const videoRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const updateVolume = (newVolume) => {
    const fixedVol = Math.max(0, Math.min(1, parseFloat(newVolume.toFixed(1))));
    if (onVolumeChange) onVolumeChange(fixedVol);
    if (videoRef.current) videoRef.current.volume = fixedVol;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(currentIndex);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(c => c - 1);
      if (e.key === "ArrowRight" && currentIndex < mediaList.length - 1) setCurrentIndex(c => c + 1);
      if (e.key === "ArrowUp") updateVolume(volume + 0.1);
      if (e.key === "ArrowDown") updateVolume(volume - 0.1);
      if (e.key === "Escape") onClose(currentIndex);
      if (e.key === " ") {
        if (videoRef.current) {
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose, mediaList.length, volume, onVolumeChange]);

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-slate-100/90 backdrop-blur-xl z-[9999] flex items-center justify-center"
      onClick={handleOverlayClick} 
    >
      <button onClick={() => onClose(currentIndex)} className="absolute top-6 right-6 bg-white/50 hover:bg-white p-2 rounded-full z-[10005]">✕</button>
      
      {currentIndex > 0 && (
        <button onClick={() => setCurrentIndex(c => c - 1)} className="absolute left-6 z-[10005] bg-white/50 p-4 rounded-full">〈</button>
      )}
      {currentIndex < mediaList.length - 1 && (
        <button onClick={() => setCurrentIndex(c => c + 1)} className="absolute right-6 z-[10005] bg-white/50 p-4 rounded-full">〉</button>
      )}

      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-3xl overflow-hidden shadow-2xl bg-black">
          {mediaList[currentIndex].type === "video" ? (
            <video 
              key={mediaList[currentIndex].url} 
              ref={videoRef} 
              src={mediaList[currentIndex].url} 
              autoPlay 
              controls={true} 
              onLoadedData={() => {
                setIsLoading(false);
                if (videoRef.current) videoRef.current.volume = volume;
              }} 
              className="max-h-[85vh] max-w-[80vw]" 
            />
          ) : (
            <img src={mediaList[currentIndex].url} className="max-h-[85vh] max-w-[80vw] object-contain" onLoad={() => setIsLoading(false)} />
          )}
        </div>
        
        {/* 커스텀 사운드바: PC에서만 나타나도록 유지 */}
        {mediaList[currentIndex].type === "video" && !isMobile && (
          <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
        )}
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
}

export default MediaViewer;