// src/components/MediaViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import VolumeControl from "./VolumeControl";
import { Maximize2, Minimize2 } from "lucide-react";

export default function MediaViewer({ mediaList, initialIndex = 0, onClose, volume, onVolumeChange }) {
  const videoRef = useRef(null);
  const viewerRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. 방어 코드: mediaList가 없으면 렌더링하지 않음
  if (!mediaList || !Array.isArray(mediaList) || mediaList.length === 0) return null;

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const updateVolume = (newVolume) => {
    const fixedVol = Math.max(0, Math.min(1, parseFloat(newVolume.toFixed(1))));
    if (onVolumeChange) onVolumeChange(fixedVol);
    if (videoRef.current) videoRef.current.volume = fixedVol;
  };

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (viewerRef.current.requestFullscreen) await viewerRef.current.requestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
      }
    } catch (error) { console.error("전체화면 전환 실패:", error); }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleCloseClick = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    if (onClose) onClose(currentIndex);
  };

  // 2. 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex(c => c - 1);
      if (e.key === "ArrowRight" && currentIndex < mediaList.length - 1) setCurrentIndex(c => c + 1);
      if (e.key === "Escape") handleCloseClick();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, mediaList.length]);

  const currentMedia = mediaList[currentIndex] || mediaList[0];

  return ReactDOM.createPortal(
    <div ref={viewerRef} className="fixed inset-0 bg-black md:bg-slate-100/50 md:backdrop-blur-xl z-[9999] flex items-center justify-center select-none" onClick={handleCloseClick}>
      <div className="absolute top-6 right-6 flex items-center gap-4 z-[10005]">
        <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="bg-white/50 hover:bg-white p-2 rounded-full text-slate-800 transition-colors shadow-sm cursor-pointer">
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleCloseClick(); }} className="bg-white/50 hover:bg-white px-3 py-2 rounded-full text-slate-800 font-bold transition-colors shadow-sm cursor-pointer">✕</button>
      </div>
      
      {currentIndex > 0 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(c => c - 1); }} className="absolute left-6 z-[10005] bg-white/50 hover:bg-white p-4 rounded-full shadow-md transition-colors cursor-pointer">〈</button>
      )}
      {currentIndex < mediaList.length - 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(c => c + 1); }} className="absolute right-6 z-[10005] bg-white/50 hover:bg-white p-4 rounded-full shadow-md transition-colors cursor-pointer">〉</button>
      )}

      <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-black flex items-center justify-center">
          {currentMedia?.type === "video" ? (
            <video key={currentMedia.url} ref={videoRef} src={currentMedia.url} autoPlay controls className="max-h-[85vh] max-w-[85vw] md:max-w-[80vw] object-contain" />
          ) : (
            <img src={currentMedia?.url} className="max-h-[85vh] max-w-[85vw] md:max-w-[80vw] object-contain pointer-events-none" alt="media" />
          )}
        </div>
        
        {currentMedia?.type === "video" && (
          <div className="hidden md:flex">
            <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}