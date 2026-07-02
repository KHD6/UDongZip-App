import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, auth } from "./firebase";
import { getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";

import Navigation from "./components/Navigation";
import MainContent from "./components/MainContent";
import RightSidebar from "./components/RightSidebar";
import PostDetailPage from "./pages/PostDetailPage";
import LoginButtons from "./components/LoginButtons";
import NicknameSetupModal from "./components/NicknameSetupModal";
import PostForm from "./components/PostForm";
import ProfilePage from "./pages/ProfilePage";

const AIRecommendPage = () => <div className="p-4">🤖 AI 페이지</div>;
const MapPage = () => <div className="p-4">📍 지도 페이지</div>;

const SettingsPage = () => {
  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) auth.signOut();
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 my-4">
      <h2 className="text-xl font-bold mb-6">⚙️ 환경설정</h2>
      <button onClick={handleLogout} className="text-red-600 cursor-pointer">로그아웃</button>
    </div>
  );
};

function AppContent() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 모바일 상·하단바 인터랙션을 위한 스크롤 상태 제어
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isGuest = !auth.currentUser || auth.currentUser.isAnonymous;
  const handleOpenWriteModal = () => {
    if (isGuest) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    setIsWriteModalOpen(true);
  };

  const handleSavePost = async (postData) => {
    try {
      await addDoc(collection(db, "posts"), {
        content: postData.content,
        mediaList: postData.mediaList,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setRefreshKey((prev) => prev + 1);
      setIsWriteModalOpen(false);
    } catch (error) {
      console.error("게시글 저장 실패:", error);
      throw error;
    }
  };

  // 모바일 동적 스크롤 감지 리스너
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsNavVisible(false); // 스크롤 내림: 상하단바 숨김
      } else {
        setIsNavVisible(true);  // 스크롤 올림: 상하단바 표시
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const checkNickname = async () => {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      setIsReady(userDoc.exists() && userDoc.data().isNicknameSet);
      setLoading(false);
    };
    checkNickname();
  }, [user]);

  if (loading) return <div>🐾 로딩 중...</div>;
  if (user && !isReady) return <NicknameSetupModal user={user} />;
  if (!user) return <div className="flex flex-col items-center justify-center min-h-screen"><LoginButtons /></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] w-full relative">
      {/* 
        새로운 통합 반응형 내비게이션 바
        모바일 스크롤 감지 상태값과 새 글 작성 핸들러 전달
      */}
      <Navigation 
        isNavVisible={isNavVisible} 
        onNewPostClick={handleOpenWriteModal} 
      />

      {/* 
        [디자인 완벽 보수] 기존에 설정해 두신 고유 마진값 완벽히 원복
        - 데스크탑 분기점별 좌측 여백 레이아웃 고수 (md:ml-[100px] xl:ml-[220px])
        - 모바일 상단 바 오버레이 현상 방지를 위해 최상단 패딩(pt-[52px])만 유연하게 결합
      */}
      <div className="pt-[52px] md:pt-0 md:ml-[100px] xl:ml-[220px] min-h-screen flex justify-center px-4 transition-all duration-300">
        <div className="flex w-full max-w-[950px] justify-center lg:justify-start">
          <main className="w-full max-w-[600px] border-x border-slate-100 min-h-screen pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<MainContent refreshKey={refreshKey} onOpenWriteModal={handleOpenWriteModal} />} />
              <Route path="/recommend" element={<AIRecommendPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/profile/:uid" element={<ProfilePage />} />
            </Routes>
          </main>
          <aside className="hidden lg:block w-[350px] pl-8 py-4">
            <div className="sticky top-4">
              <RightSidebar />
            </div>
          </aside>
        </div>
      </div>

      {isWriteModalOpen && (
        <PostForm
          onSubmit={handleSavePost}
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