// src/context/ViewerContext.jsx
import React, { createContext, useContext, useState } from "react";
import MediaViewer from "../components/common/MediaViewer";

const ViewerContext = createContext(null);

export function ViewerProvider({ children }) {
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, onClose: null });
  const [volume, setVolume] = useState(0.8);

  const openViewer = (list, index, onClose = null) => {
    setViewer({ isOpen: true, list, index, onClose });
  };

  const closeViewer = (lastIndex) => {
    if (viewer.onClose) viewer.onClose(lastIndex);
    setViewer(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <ViewerContext.Provider value={{ openViewer, volume, setVolume }}>
      {children}
      {viewer.isOpen && (
        <MediaViewer
          mediaList={viewer.list}
          initialIndex={viewer.index}
          volume={volume}
          onVolumeChange={setVolume}
          onClose={closeViewer}
        />
      )}
    </ViewerContext.Provider>
  );
}

export const useViewer = () => {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
};