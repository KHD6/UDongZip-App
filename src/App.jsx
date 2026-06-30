import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainContent from "./MainContent";
import LoginButtons from "./components/LoginButtons";
import { updateProfile, signOut } from "firebase/auth";
import { auth } from "./firebase";

function AppContent() {
  const { user } = useAuth();

  if (user && !user.displayName) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#fdfbf7]">
        <h2 className="text-xl font-bold text-slate-800">닉네임을 입력해주세요</h2>

        <input
          id="nick"
          defaultValue={""} // 새 사용자는 빈칸
          className="border p-2 rounded w-64"
          placeholder="사용할 닉네임"
        />

        <div className="flex gap-2">
          <button
            onClick={async () => {
              const nick = document.getElementById("nick").value;
              if (nick.trim()) {
                // Firebase 프로필 업데이트
                await updateProfile(user, { displayName: nick });
                // 중요: 상태가 동기화되도록 강제 새로고침
                window.location.reload(); 
              }
            }}
            className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700 transition cursor-pointer"
          >
            시작하기
          </button>

          <button
            onClick={async () => {
              await signOut(auth);
              window.location.reload();
            }}
            className="bg-slate-200 text-slate-600 px-4 py-2 rounded hover:bg-slate-300 transition cursor-pointer"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 2. 로그인 안 했으면 로그인 화면, 했으면 메인 화면
  return !user ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfbf7]">
      <h1 className="text-3xl font-bold mb-8 text-slate-800">우동집</h1>
      <LoginButtons />
    </div>
  ) : (
    <MainContent />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
