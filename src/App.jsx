import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainContent from "./components/MainContent";
import LoginButtons from "./components/LoginButtons";
import NicknameSetupModal from "./components/NicknameSetupModal";
import { db } from "./firebase"; // 여기를 ./firebase로 수정
import { getDoc, doc } from "firebase/firestore";

function AppContent() {
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>로딩 중...</div>;

  if (user && !isReady) {
    return <NicknameSetupModal user={user} />;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7]">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">우동집</h1>
        <LoginButtons />
      </div>
    );
  }

  return <MainContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}