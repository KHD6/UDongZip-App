import React from "react";
import { updateProfile } from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function NicknameSetupModal({ user }) {
  const handleSave = async () => {
    const nick = document.getElementById("nick").value;
    if (nick.trim()) {
      await updateProfile(user, { displayName: nick });
      await setDoc(doc(db, "users", user.uid), { isNicknameSet: true }, { merge: true });
      window.location.reload();
    }
  };

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