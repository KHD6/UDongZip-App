import React, { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { db, GUEST_NICKNAMES } from "../firebase";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

function NicknameSetupModal({ user }) {
  const [nick, setNick] = useState(user?.displayName || "");
  const [handle, setHandle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("text-slate-500");
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
            photoURL: "/default-profile.png", // 게스트는 기본 이미지 강제 지정
            isNicknameSet: true,
            isAnonymous: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          window.location.reload();
        } catch (error) {
          console.error("게스트 자동 닉네임 설정 실패:", error);
        }
      };

      handleAutoGuestSetup();
    }
  }, [user]);

  // 고유 핸들 실시간 유효성 처리 (소문자, 숫자, 언더바, 마침표만 허용)
  const handleHandleChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setHandle(value);
    setStatusMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!nick.trim() || !handle.trim()) {
      setStatusMessage("모든 필드를 입력해 주세요.");
      setStatusColor("text-red-500");
      return;
    }

    if (handle.length < 4) {
      setStatusMessage("고유 아이디는 4자 이상이어야 합니다.");
      setStatusColor("text-red-500");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("고유 아이디 중복 확인 중...");
    setStatusColor("text-blue-500");

    try {
      // 1. Firestore를 통한 고유 handle 중복 검사 실행
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("user_handle", "==", handle.trim()));
      const querySnapshot = await getDocs(q);
      
      let isDuplicate = false;
      querySnapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          isDuplicate = true;
        }
      });

      if (isDuplicate) {
        setStatusMessage("이미 사용 중인 고유 아이디입니다.");
        setStatusColor("text-red-500");
        setIsSubmitting(false);
        return;
      }

      // 2. Auth 프로필 및 Firestore 유저 도큐먼트 통합 갱신
      // 구글 로그인 유저의 photoURL을 명확히 확보하여 함께 적재 보장
      const currentUserPhoto = user.photoURL || "/default-profile.png";

      await updateProfile(user, { displayName: nick.trim() });
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: nick.trim(),
        user_handle: handle.trim(),
        photoURL: currentUserPhoto, // 데이터 누락 원천 차단
        isNicknameSet: true,
        isAnonymous: false,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      window.location.reload();
    } catch (error) {
      console.error("닉네임 및 고유 아이디 저장 실패:", error);
      setStatusMessage("저장 중 오류가 발생했습니다.");
      setStatusColor("text-red-500");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user && user.isAnonymous) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-slate-900/90 text-white text-sm px-6 py-3 rounded-full shadow-lg animate-pulse">
          🐾 방문자 프로필 구성 중...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">프로필 초기 설정</h2>
        <p className="text-xs text-slate-500 mb-5">서비스 이용을 위해 닉네임과 고유 아이디를 지정해 주세요.</p>
        
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">사용자 닉네임</label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-sm focus:outline-none focus:border-slate-900 transition-colors"
              placeholder="닉네임 입력 (중복 허용)"
              maxLength={20}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">고유 식별 아이디 (@handle)</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm font-medium text-slate-400 select-none">@</span>
              <input
                type="text"
                value={handle}
                onChange={handleHandleChange}
                className="w-full border border-slate-200 bg-slate-50 pl-7 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-slate-900 transition-colors"
                placeholder="username (영문 소문자/숫자/_/.)"
                maxLength={15}
              />
            </div>
          </div>

          {statusMessage && (
            <p className={`text-xs font-medium ${statusColor} animate-in fade-in-50 duration-150`}>
              {statusMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold text-sm hover:bg-slate-900 shadow-sm transition-colors disabled:bg-slate-200 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? "확인 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NicknameSetupModal;