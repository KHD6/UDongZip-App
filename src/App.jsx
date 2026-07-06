// src/App.jsx
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
import MediaViewer from "./components/MediaViewer";

const AIRecommendPage = () => <div className="p-4">🤖 AI 페이지</div>;
const MapPage = () => <div className="p-4">📍 지도 페이지</div>;

function SettingsPage() {
  const handleLogout = () => { if (window.confirm("로그아웃 하시겠습니까?")) auth.signOut(); };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 my-4">
      <h2 className="text-xl font-bold mb-6">⚙️ 환경설정</h2>
      <button onClick={handleLogout} className="text-red-600 cursor-pointer">로그아웃</button>
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

  const handleOpenWriteModal = () => setIsWriteModalOpen(true);
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

  if (loading) return <div>🐾 로딩 중...</div>;
  if (user && !isReady) return <NicknameSetupModal user={user} />;
  if (!user) return <div className="flex flex-col items-center justify-center min-h-screen"><LoginButtons /></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] w-full relative">
      <Navigation isNavVisible={isNavVisible} onNewPostClick={handleOpenWriteModal} />
      <div className="pt-[52px] md:pt-0 md:ml-[100px] xl:ml-[220px] min-h-screen flex justify-center px-4">
        <div className="flex w-full max-w-[950px] justify-center lg:justify-start">
          <main className="w-full max-w-[600px] border-x border-slate-100 min-h-screen pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<MainContent refreshKey={refreshKey} onOpenWriteModal={handleOpenWriteModal} setViewer={setViewer} volume={volume} setVolume={setVolume} />} />
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
          mediaList={viewer.list}
          initialIndex={viewer.index}
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