import { useEffect } from "react";

export function useKeyPress(targetKey, callback, active) {
  useEffect(() => {
    // active(호버 여부)가 false면 아무것도 안 함
    if (!active) return;

    const handler = (e) => {
      if (e.key === targetKey) {
        e.preventDefault(); // 스크롤 방지
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [targetKey, callback, active]);
}