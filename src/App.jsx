import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, auth, GUEST_NICKNAMES } from "./firebase";
import { getDoc, doc, collection, addDoc } from "firebase/firestore";

import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import BottomNav from "./components/BottomNav";
import PostDetailPage from "./pages/PostDetailPage";
import LoginButtons from "./components/LoginButtons";
import NicknameSetupModal from "./components/NicknameSetupModal";
import PostForm from "./components/PostForm";

const AIRecommendPage = () => <div className="text-xl font-bold py-4 px-4 md:px-0">🤖 AI 반려동물 추천 페이지 (준비 중)</div>;
const MapPage = () => <div className="text-xl font-bold py-4 px-4 md:px-0">📍 동네 모임 & 병원 지도 페이지 (준비 중)</div>;
const ProfilePage = () => <div className="text-xl font-bold py-4 px-4 md:px-0">👤 유저 프로필 페이지 (준비 중)</div>;

const SettingsPage = () => {
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      auth.signOut();
    }
  };

  return (
    <div className="max-w-md w-[calc(100%-32px)] mx-auto md:mx-0 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 my-4 md:my-0">
      <h2 className="text-xl font-bold mb-6 text-slate-800">⚙️ 환경설정</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-slate-50">
          <div>
            <p className="text-sm font-medium text-slate-700">계정 관리</p>
            <p className="text-xs text-slate-400 mt-0.5">현재 계정에서 로그아웃합니다.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const location = useLocation();
  const isGuest = !auth.currentUser || auth.currentUser.isAnonymous;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const checkNickname = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      setIsReady(userDoc.exists() && userDoc.data().isNicknameSet);
      setLoading(false);
    };
    checkNickname();
  }, [user]);

  const handleOpenWriteModal = () => {
    if (isGuest) {
      alert("우동집 정식 집사만 글을 쓸 수 있어요! 구글이나 이메일로 로그인해 주세요.");
      return;
    }
    setIsWriteModalOpen(true);
  };

  const handleCreatePost = async ({ content, mediaList }) => {
    if (isGuest) return;

    try {
      const getRandomNickname = () => GUEST_NICKNAMES[Math.floor(Math.random() * GUEST_NICKNAMES.length)];

      await addDoc(collection(db, "posts"), {
        content,
        mediaList,
        uid: auth.currentUser.uid,
        nickname: auth.currentUser.displayName || getRandomNickname(),
        photoURL: auth.currentUser.photoURL || null,
        createdAt: new Date(),
      });
      
      setRefreshKey((prev) => prev + 1);
      setIsWriteModalOpen(false);
    } catch (error) {
      console.error("저장 실패: ", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">🐾 로딩 중...</div>;
  if (user && !isReady) return <NicknameSetupModal user={user} />;
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7]">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">우동집</h1>
        <LoginButtons />
      </div>
    );
  }

  const isWidePage = location.pathname === "/map";
  const layoutMaxWidth = isWidePage ? "max-w-[1400px]" : "max-w-[1150px]";

  return (
    // 🌟 1. 최상위 래퍼는 max-w 없이 w-full로 화면 전체를 채웁니다.
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 flex flex-col md:flex-row w-full pb-16 md:pb-0">
      
      {/* 🌟 2. 사이드바는 무조건 화면 좌측에 고정됩니다. */}
      <Sidebar onNewPostClick={handleOpenWriteModal} />

      {/* 🌟 3. 메인 영역: 남은 우측 공간(flex-1)을 꽉 채우고, 내부 컨텐츠만 max-w로 너비 제어 및 중앙(mx-auto) 정렬합니다. */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className={`w-full ${layoutMaxWidth} mx-auto py-14 md:py-4 px-0 md:px-4`}>
          <Routes>
            <Route 
              path="/" 
              element={
                <MainContent 
                  refreshKey={refreshKey} 
                  onOpenWriteModal={handleOpenWriteModal} 
                />
              } 
            />
            <Route path="/recommend" element={<AIRecommendPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/post/:postId" element={<PostDetailPage />} />
            <Route path="/profile/:uid" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>

      <BottomNav />

      {isWriteModalOpen && (
        <PostForm
          onSubmit={handleCreatePost}
          onClose={() => setIsWriteModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}