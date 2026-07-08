// src/components/common/VolumeControl.jsx
import React, { useState } from "react";

export default function VolumeControl({ volume, onVolumeChange }) {
  const [lastVolume, setLastVolume] = useState(volume > 0 ? volume : 0.5);

  const toggleMute = (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    if (volume > 0) {
      setLastVolume(volume);
      onVolumeChange(0);
    } else {
      onVolumeChange(lastVolume || 0.5);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 bg-black/70 p-3 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="cursor-pointer accent-white"
        style={{ 
          appearance: 'slider-vertical', 
          WebkitAppearance: 'slider-vertical',
          width: '8px', 
          height: '100px' 
        }}
      />
      <span 
        onClick={toggleMute}
        className="text-white text-xl select-none cursor-pointer hover:scale-110 transition-transform"
      >
        {volume > 0 ? "🔊" : "🔇"}
      </span>
    </div>
  );
}