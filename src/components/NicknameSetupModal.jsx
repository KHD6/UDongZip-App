import React, { useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { db, GUEST_NICKNAMES } from "../firebase"; // 중앙에서 공유된 닉네임 리스트 임포트
import { doc, setDoc } from "firebase/firestore";

function NicknameSetupModal({ user }) {
  
  useEffect(() => {
    if (user && user.isAnonymous) {
      const handleAutoGuestSetup = async () => {
        try {
          // 공유 배열에서 랜덤 닉네임 추출
          const randomNickname = GUEST_NICKNAMES[Math.floor(Math.random() * GUEST_NICKNAMES.length)];
          
          // 1. 프로필 업데이트
          await updateProfile(user, { displayName: randomNickname });
          
          // 2. 고도화된 규칙 덕분에 이제 정상적으로 내 문서 작성이 허용됩니다.
          await setDoc(doc(db, "users", user.uid), { isNicknameSet: true }, { merge: true });
          
          // 3. 동기화 새로고침
          window.location.reload();
        } catch (error) {
          console.error("게스트 자동 닉네임 설정 실패:", error);
        }
      };

      handleAutoGuestSetup();
    }
  }, [user]);

  const handleSave = async () => {
    const nick = document.getElementById("nick").value;
    if (nick.trim()) {
      try {
        await updateProfile(user, { displayName: nick });
        await setDoc(doc(db, "users", user.uid), { isNicknameSet: true }, { merge: true });
        window.location.reload();
      } catch (error) {
        console.error("닉네임 저장 실패:", error);
      }
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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl w-80 shadow-xl">
        <h2 className="text-xl font-bold mb-4">닉네임 설정</h2>
        <input
          id="nick"
          defaultValue={user.displayName || ""}
          className="w-full border p-2 rounded mb-4"
          placeholder="닉네임 입력"
        />
        <button
          onClick={handleSave}
          className="w-full bg-slate-800 text-white p-2 rounded hover:bg-slate-700"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

export default NicknameSetupModal;