// src/components/NicknameSetupModal.jsx
import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { db, GUEST_NICKNAMES } from "../../firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { User, AtSign, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NicknameSetupModal({ user }) {
  const [nick, setNick] = useState(user?.displayName || "");
  const [handle, setHandle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.isAnonymous) {
      const handleAutoGuestSetup = async () => {
        try {
          const randomNickname = GUEST_NICKNAMES[Math.floor(Math.random() * GUEST_NICKNAMES.length)];
          const guestHandle = `guest_${user.uid.slice(-6).toLowerCase()}`;
          await updateProfile(user, { displayName: randomNickname });
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: randomNickname,
            user_handle: guestHandle,
            photoURL: "/default-profile.png",
            isNicknameSet: true,
            isAnonymous: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          window.location.reload();
        } catch (error) { console.error(error); }
      };
      handleAutoGuestSetup();
    }
  }, [user]);

  const handleHandleChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setHandle(value);
    setStatusMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nick.trim() || !handle.trim()) {
      setStatusMessage("닉네임과 고유 아이디를 모두 입력해주세요.");
      setIsError(true);
      return;
    }
    if (handle.length < 4) {
      setStatusMessage("고유 아이디는 4자 이상이어야 합니다.");
      setIsError(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(db, "users"), where("user_handle", "==", handle.trim()));
      const querySnapshot = await getDocs(q);
      let isDuplicate = false;
      querySnapshot.forEach((doc) => { if (doc.id !== user.uid) isDuplicate = true; });

      if (isDuplicate) {
        setStatusMessage("이미 사용 중인 고유 아이디입니다. 😢");
        setIsError(true);
        setIsSubmitting(false);
        return;
      }

      await updateProfile(user, { displayName: nick.trim() });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: nick.trim(),
        user_handle: handle.trim(),
        photoURL: user.photoURL || "/default-profile.png",
        isNicknameSet: true,
        isAnonymous: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      window.location.reload();
    } catch (error) {
      setStatusMessage("저장 중 오류가 발생했습니다.");
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && user.isAnonymous) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#fdfbf7]/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl animate-bounce">🐾</div>
          <p className="font-black text-slate-800 tracking-tight">집사님 프로필을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fdfbf7] w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-white"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏠</div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter">환영합니다!</h2>
          <p className="text-slate-400 text-sm font-bold mt-1">우동집에서 사용할 정보를 설정해주세요.</p>
        </div>
        
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#c29b7c] uppercase ml-2 tracking-wider">사용자 닉네임</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c29b7c] transition-colors" size={18} />
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="w-full bg-white border-2 border-white rounded-[22px] pl-12 pr-4 py-4 outline-none text-sm font-bold text-slate-700 shadow-sm focus:border-[#c29b7c] transition-all"
                placeholder="예: 보리집사"
                maxLength={20}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-[#c29b7c] uppercase ml-2 tracking-wider">고유 아이디 (@handle)</label>
            <div className="relative group">
              <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#c29b7c] transition-colors" size={18} />
              <input
                type="text"
                value={handle}
                onChange={handleHandleChange}
                className="w-full bg-white border-2 border-white rounded-[22px] pl-12 pr-4 py-4 outline-none text-sm font-bold text-slate-700 shadow-sm focus:border-[#c29b7c] transition-all"
                placeholder="영문 소문자, 숫자, _, ."
                maxLength={15}
              />
            </div>
          </div>

          <AnimatePresence>
            {statusMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 px-2 text-xs font-bold ${isError ? "text-red-500" : "text-green-600"}`}
              >
                {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {statusMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#c29b7c] text-white py-4 rounded-[22px] font-black text-sm shadow-md shadow-orange-900/10 hover:bg-[#b08968] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? "준비 중..." : "우동집 시작하기"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}