import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, auth } from "./firebase";
import { getDoc, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";

import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import BottomNav from "./components/BottomNav";
import RightSidebar from "./components/RightSidebar";
import PostDetailPage from "./pages/PostDetailPage";
import LoginButtons from "./components/LoginButtons";
import NicknameSetupModal from "./components/NicknameSetupModal";
import PostForm from "./components/PostForm";

const AIRecommendPage = () => <div className="p-4">🤖 AI 페이지</div>;
const MapPage = () => <div className="p-4">📍 지도 페이지</div>;
const ProfilePage = () => <div className="p-4">👤 프로필 페이지</div>;

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
      <div className="hidden md:block fixed left-0 top-0 h-full w-[100px] xl:w-[220px] bg-[#f3f0e8] transition-all duration-300 z-50">
        <Sidebar onNewPostClick={handleOpenWriteModal} />
      </div>

      <div className="md:ml-[100px] xl:ml-[220px] min-h-screen flex justify-center px-4 transition-all duration-300">
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
            <div className="sticky top-4"><RightSidebar /></div>
          </aside>
        </div>
      </div>
      <BottomNav />
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