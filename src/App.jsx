// src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ViewerProvider } from "./context/ViewerContext";
import { db, auth } from "./firebase";
import { getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";

import Navigation from "./components/layout/Navigation";
import MainContent from "./components/post/MainContent";
import RightSidebar from "./components/layout/RightSidebar";
import PostDetailPage from "./pages/PostDetailPage";
import LoginButtons from "./components/auth/LoginButtons";
import NicknameSetupModal from "./components/auth/NicknameSetupModal";
import PostForm from "./components/post/PostForm";
import ProfilePage from "./pages/ProfilePage";

const AIRecommendPage = () => <div className="p-4 bg-[#fdfbf7] min-h-screen">🤖 AI 페이지</div>;
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
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
    const checkUser = auth.onAuthStateChanged(async (user) => {
      if (!user) { setLoading(false); return; }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setIsReady(userDoc.exists() && userDoc.data().isNicknameSet);
      setLoading(false);
    });
    return checkUser;
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-[#fdfbf7]">🐾</div>;
  if (auth.currentUser && !isReady) return <NicknameSetupModal user={auth.currentUser} />;
  if (!auth.currentUser) return <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center"><LoginButtons /></div>;

  return (
    <div className="min-h-screen bg-[#fdfbf7] w-full relative">
      <Navigation isNavVisible={isNavVisible} onNewPostClick={handleOpenWriteModal} />
      <div className="pt-[52px] md:pt-0 md:ml-[100px] xl:ml-[220px] min-h-screen flex justify-center px-4 transition-all duration-300">
        <div className="flex w-full max-w-[950px] justify-center lg:justify-start">
          <main className="w-full max-w-[600px] border-x border-slate-100/60 min-h-screen pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<MainContent refreshKey={refreshKey} onOpenWriteModal={handleOpenWriteModal} isNavVisible={isNavVisible} />} />
              <Route path="/recommend" element={<AIRecommendPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/post/:postId" element={<PostDetailPage />} />
              <Route path="/profile/:uid" element={<ProfilePage />} />
            </Routes>
          </main>
          <aside className="hidden lg:block w-[350px] pl-8 py-4"><div className="sticky top-4"><RightSidebar /></div></aside>
        </div>
      </div>
      {isWriteModalOpen && <PostForm onSubmit={handleSavePost} onClose={() => setIsWriteModalOpen(false)} />}
    </div>
  );
}

export default function App() { 
  return (
    <BrowserRouter>
      <AuthProvider>
        <ViewerProvider>
          <AppContent />
        </ViewerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}