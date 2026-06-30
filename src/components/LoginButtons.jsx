import React from "react";
import { auth } from "../firebase";
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function LoginButtons() {
  const googleProvider = new GoogleAuthProvider();

  const handleGoogleLogin = () => signInWithPopup(auth, googleProvider);
  const handleAnonymousLogin = () => signInAnonymously(auth);

  return (
    <div className="flex flex-col gap-3 p-4">
      <button onClick={handleGoogleLogin} className="bg-blue-500 text-white p-2 rounded cursor-pointer">
        구글로 로그인
      </button>
      <button onClick={handleAnonymousLogin} className="bg-gray-500 text-white p-2 rounded cursor-pointer">
        익명으로 시작하기
      </button>
      {/* 이메일 로그인은 나중에 폼을 따로 만들어서 연결할게요! */}
    </div>
  );
}

export default LoginButtons;