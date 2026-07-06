// src/components/LoginButtons.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 리다이렉션을 위한 import
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../../firebase";
import { Mail, Lock, Globe, LogIn, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginButtons() {
  const navigate = useNavigate(); // 네비게이트 함수 초기화
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleProvider = new GoogleAuthProvider();

  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found": return "등록되지 않은 이메일입니다.";
      case "auth/wrong-password": return "비밀번호가 일치하지 않습니다.";
      case "auth/email-already-in-use": return "이미 사용 중인 이메일입니다.";
      case "auth/weak-password": return "비밀번호는 6자리 이상이어야 합니다.";
      case "auth/invalid-email": return "유효하지 않은 이메일 형식입니다.";
      default: return "인증에 실패했습니다. 다시 시도해주세요.";
    }
  };

  // 공통 리다이렉션 처리 함수
  const onSuccess = () => {
    navigate("/"); // 성공 시 메인(타임라인)으로 이동
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onSuccess(); // 성공 후 이동
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess(); // 성공 후 이동
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      await signInAnonymously(auth);
      onSuccess(); // 성공 후 이동
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-[400px] px-6 py-12 flex flex-col items-center bg-[#fdfbf7] min-h-screen justify-center">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4 cursor-default text-slate-800">🐾</div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter cursor-default">우리 동네 집사들</h1>
        <p className="text-slate-400 text-sm font-bold mt-2 cursor-default">우동집에서 시작하는 따뜻한 반려동물 일상</p>
      </div>

      <div className="w-full flex bg-slate-100 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => { setIsLogin(true); setError(""); }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
            isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-500"
          }`}
        >
          로그인
        </button>
        <button 
          onClick={() => { setIsLogin(false); setError(""); }}
          className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
            !isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-500"
          }`}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleEmailAuth} className="w-full space-y-3">
        <div className="relative group">
          <Mail 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c29b7c] transition-colors" 
            size={18} 
          />
          <input 
            type="email" 
            placeholder="이메일 주소" 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-white rounded-[20px] outline-none text-sm font-bold text-slate-700 shadow-sm focus:border-[#c29b7c] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="relative group">
          <Lock 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c29b7c] transition-colors" 
            size={18} 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-white rounded-[20px] outline-none text-sm font-bold text-slate-700 shadow-sm focus:border-[#c29b7c] transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-xs font-bold px-2 flex items-center gap-1"
            >
              <AlertCircle size={12} /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#c29b7c] text-white rounded-[20px] font-black text-sm shadow-md shadow-orange-900/10 hover:bg-[#b08968] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : isLogin ? "우동집 입장하기" : "집사로 등록하기"}
        </button>
      </form>

      <div className="w-full flex items-center my-8 gap-4">
        <div className="flex-1 h-[1px] bg-slate-200" />
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-default">또는</span>
        <div className="flex-1 h-[1px] bg-slate-200" />
      </div>

      <div className="w-full space-y-3">
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white border-2 border-slate-50 text-slate-600 rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
        >
          <Globe size={20} className="text-blue-500" /> 구글 계정으로 시작
        </button>
        <button 
          onClick={handleAnonymousLogin}
          className="w-full py-4 bg-slate-800 text-white rounded-[20px] font-bold text-sm flex items-center justify-center gap-3 hover:bg-slate-900 transition-all cursor-pointer shadow-md"
        >
          <LogIn size={20} className="text-slate-400" /> 익명으로 구경하기
        </button>
      </div>
      
      <p className="mt-10 text-[11px] text-slate-400 text-center leading-relaxed cursor-default">
        계속 진행함으로써 우동집의 <span className="underline cursor-pointer hover:text-slate-600">이용약관</span> 및 <br/>
        <span className="underline cursor-pointer hover:text-slate-600">개인정보 처리방침</span>에 동의하게 됩니다.
      </p>
    </div>
  );
}