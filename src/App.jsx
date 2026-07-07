// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, auth } from "./firebase";
import { getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Layout 컴포넌트
import Navigation from "./components/layout/Navigation";
import RightSidebar from "./components/layout/RightSidebar";

// Auth 컴포넌트
import LoginButtons from "./components/auth/LoginButtons";
import NicknameSetupModal from "./components/auth/NicknameSetupModal";

// Post 및 메인 컨텐츠
import MainContent from "./components/post/MainContent";
import PostForm from "./components/post/PostForm";

// Common 컴포넌트
import MediaViewer from "./components/common/MediaViewer";

// Pages
import PostDetailPage from "./pages/PostDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AIRecommendPage from "./pages/AIRecommendPage"; // ❗ 임시 컴포넌트 대신 신규 파일 임포트

const MapPage = () => <div className="p-4 bg-[#fdfbf7] min-h-screen">📍 지도 페이지</div>;

function SettingsPage() {
  const handleLogout = () => { if (window.confirm("로그아웃 하시겠습니까?")) auth.signOut(); };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-[32px] shadow-sm border border-slate-100 my-4">
      <h2 className="text-xl font-black mb-6">⚙️ 환경설정</h2>
      <button onClick={handleLogout} className="text-red-600 font-bold cursor-pointer hover:underline">로그아웃</button>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [volume, setVolume] = useState(0.8);
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, onClose: null });

  const handleOpenWriteModal = () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) { alert("로그인 후 이용 가능합니다."); return; }
    setIsWriteModalOpen(true);
  };

  const handleSavePost = async (postData) => {
    await addDoc(collection(db, "posts"), {
      content: postData.content, mediaList: postData.mediaList,
      uid: auth.currentUser.uid, createdAt: serverTimestamp(),
    });
    setRefreshKey((prev) => prev + 1);
    setIsWriteModalOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNavVisible(currentScrollY <= 50 || currentScrollY < lastScrollY);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const checkNickname = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setIsReady(userDoc.exists() && userDoc.data().isNicknameSet);
      setLoading(false);
    };
    checkNickname();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#fdfbf7]">🐾</div>;
  if (user && !isReady) return <NicknameSetupModal user={user} />;
  if (!user) return <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center"><LoginButtons /></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] w-full relative">
      <Navigation isNavVisible={isNavVisible} onNewPostClick={handleOpenWriteModal} />
      <div className="pt-[52px] md:pt-0 md:ml-[100px] xl:ml-[220px] min-h-screen flex justify-center px-4 transition-all duration-300">
        <div className="flex w-full max-w-[950px] justify-center lg:justify-start">
          <main className="w-full max-w-[600px] border-x border-slate-100/60 min-h-screen pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<MainContent refreshKey={refreshKey} onOpenWriteModal={handleOpenWriteModal} setViewer={setViewer} volume={volume} setVolume={setVolume} isNavVisible={isNavVisible} />} />
              <Route path="/recommend" element={<AIRecommendPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/profile/:uid" element={<ProfilePage setViewer={setViewer} volume={volume} setVolume={setVolume} />} />
            </Routes>
          </main>
          <aside className="hidden lg:block w-[350px] pl-8 py-4"><div className="sticky top-4"><RightSidebar /></div></aside>
        </div>
      </div>

      {isWriteModalOpen && <PostForm onSubmit={handleSavePost} onClose={() => setIsWriteModalOpen(false)} />}
      
      {viewer.isOpen && (
        <MediaViewer
          {...viewer}
          volume={volume}
          onVolumeChange={setVolume}
          onClose={(lastIndex) => {
            if (viewer.onClose) viewer.onClose(lastIndex);
            setViewer(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )}
    </div>
  );
}

export default function App() { return <BrowserRouter><AuthProvider><AppContent /></AuthProvider></BrowserRouter>; }