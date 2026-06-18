import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import VolumeControl from "./VolumeControl";

const STORAGE_INDEX_KEY = "udongzip_media_index";
const STORAGE_VOLUME_KEY = "udongzip_media_volume";

function MediaViewer({ mediaList, initialIndex = 0, onClose, volume: initialVolume, onVolumeChange }) {
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const getStoredIndex = () => {
    const stored = localStorage.getItem(STORAGE_INDEX_KEY);
    const parsed = parseInt(stored, 10);
    return !isNaN(parsed) && parsed >= 0 && parsed < mediaList.length ? parsed : initialIndex;
  };

  const getStoredVolume = () => {
    const stored = localStorage.getItem(STORAGE_VOLUME_KEY);
    return stored ? parseFloat(stored) : (initialVolume !== undefined ? initialVolume : 0.5);
  };

  const [currentIndex, setCurrentIndex] = useState(getStoredIndex());
  const [currentVolume, setCurrentVolume] = useState(getStoredVolume());

  useEffect(() => {
    localStorage.setItem(STORAGE_INDEX_KEY, currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem(STORAGE_VOLUME_KEY, currentVolume);
  }, [currentVolume]);

  const updateVolume = (val) => {
    const fixedVol = parseFloat(val.toFixed(1));
    setCurrentVolume(fixedVol);
    if (onVolumeChange) onVolumeChange(fixedVol);
    if (videoRef.current) videoRef.current.volume = fixedVol;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 방향키 스크롤 방지
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((c) => c - 1);
      if (e.key === "ArrowRight" && currentIndex < mediaList.length - 1) setCurrentIndex((c) => c + 1);
      if (e.key === "ArrowUp") updateVolume(Math.min(currentVolume + 0.1, 1));
      if (e.key === "ArrowDown") updateVolume(Math.max(currentVolume - 0.1, 0));
      if (e.key === "Escape") onClose(currentIndex);
      if (e.key === " ") {
        if (videoRef.current) videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentVolume, onClose, mediaList.length]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    
    if (videoRef.current) {
      videoRef.current.volume = currentVolume;
      videoRef.current.play().catch((e) => console.log("자동재생 제한:", e));
    }
    
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center">
      <button 
        onClick={() => onClose(currentIndex)} 
        className="absolute top-4 right-4 text-white text-3xl z-[10005] p-2 hover:bg-white/10 rounded-full"
      >
        ✕
      </button>

      <div className="flex items-center gap-6">
        <div className="relative">
          {mediaList[currentIndex].type === "video" ? (
            <video
              key={mediaList[currentIndex].url}
              ref={videoRef}
              src={mediaList[currentIndex].url}
              controls
              playsInline
              className="max-h-[90vh] max-w-[80vw]"
            />
          ) : (
            <img src={mediaList[currentIndex].url} className="max-h-[90vh] max-w-[80vw] object-contain" alt="" />
          )}
        </div>

        {/* 볼륨 컨트롤러: 영상일 때만 노출 */}
        {!isMobile && mediaList[currentIndex].type === "video" && (
          <div className="z-[10001]">
            <VolumeControl volume={currentVolume} onVolumeChange={updateVolume} />
          </div>
        )}
      </div>

      {currentIndex > 0 && (
        <button className="absolute left-4 z-[10005] bg-black/50 text-white p-4 rounded-full" onClick={() => setCurrentIndex((c) => c - 1)}>〈</button>
      )}
      {currentIndex < mediaList.length - 1 && (
        <button className="absolute right-20 z-[10005] bg-black/50 text-white p-4 rounded-full" onClick={() => setCurrentIndex((c) => c + 1)}>〉</button>
      )}
    </div>,
    document.getElementById("modal-root") || document.body
  );
}

export default MediaViewer;