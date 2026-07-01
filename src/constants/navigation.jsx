// src/constants/navigation.jsx
import { Home, MapPin, Sparkles, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { path: "/", label: "타임라인", icon: Home },
  { path: "/recommend", label: "AI 추천", icon: Sparkles },
  { path: "/map", label: "동네 지도", icon: MapPin },
  { path: "/settings", label: "설정", icon: Settings },
];