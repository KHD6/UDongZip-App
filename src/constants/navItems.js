import { Home, MapPin, Sparkles, User, Settings, MoreHorizontal } from "lucide-react";

// 고유 메뉴 속성 정의
export const MENU_DETAILS = {
  timeline: { path: "/", label: "타임라인", icon: Home },
  recommend: { path: "/recommend", label: "AI 추천", icon: Sparkles },
  map: { path: "/map", label: "동네 지도", icon: MapPin },
  profile: { path: "/profile", label: "프로필", icon: User },
  settings: { path: "/settings", label: "설정", icon: Settings },
  more: { path: "#", label: "더보기", icon: MoreHorizontal }
};

// 1. PC 데스크탑 사이드바 노출 순서
export const PC_NAV_ITEMS = [
  MENU_DETAILS.timeline,
  MENU_DETAILS.recommend,
  MENU_DETAILS.map,
  MENU_DETAILS.settings,
];

// 2. 모바일 하단바 노출 순서 (요구사항: AI추천, 지도, 타임라인, 더보기, 프로필 총 5개)
export const MOBILE_NAV_ITEMS = [
  MENU_DETAILS.recommend,
  MENU_DETAILS.map,
  MENU_DETAILS.timeline,
  MENU_DETAILS.more,
  MENU_DETAILS.profile,
];