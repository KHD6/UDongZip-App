// src/components/EditProfileModal.jsx
import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db, storage } from "../firebase"; // storage import
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditProfileModal({ userData, uid, onClose, onUpdate }) {
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [bio, setBio] = useState(userData.bio || "");
  const [pets, setPets] = useState(userData.pets || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileName = `pets/${uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newPets = [...pets];
      newPets[index].photoURL = url;
      setPets(newPets);
    } catch (err) { console.error("이미지 업로드 실패:", err); } 
    finally { setIsUploading(false); }
  };

  const handleSave = async () => {
    if (isUploading) return;
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "users", uid), { displayName, bio, pets });
      if (onUpdate) await onUpdate();
      onClose(); 
    } catch (err) { console.error("업데이트 실패:", err); alert("저장에 실패했습니다."); } finally { setIsUploading(false); }
  };

  const addPet = () => setPets([...pets, { name: `새로운 펫 ${pets.length + 1}`, photoURL: "/default-profile.png" }]);

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">프로필 편집</h2>
        <div className="space-y-4">
          <input className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="닉네임" />
          <textarea className="w-full p-3 bg-slate-50 rounded-xl outline-none" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="자기소개" />
          
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2 text-sm flex items-center gap-2">
              반려동물 관리 <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-500">{pets.length}</span>
            </h3>
            <div className="h-[250px] overflow-y-auto pr-2 space-y-3 mb-2">
              {pets.map((pet, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className="w-12 h-12 rounded-full overflow-hidden cursor-pointer flex-shrink-0 border">
                    <img src={pet.photoURL} className="w-full h-full object-cover" alt="pet" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, i)} />
                  </label>
                  <input className="flex-1 p-2 bg-slate-50 rounded-lg text-sm" value={pet.name} onChange={(e) => {
                    const newPets = [...pets]; newPets[i].name = e.target.value; setPets(newPets);
                  }} />
                  <button onClick={() => setPets(pets.filter((_, idx) => idx !== i))} className="text-red-500 text-xs cursor-pointer">삭제</button>
                </div>
              ))}
            </div>
            <button onClick={addPet} className="w-full py-2 bg-slate-100 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-200 transition-colors">+ 펫 추가</button>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border cursor-pointer hover:bg-slate-50">취소</button>
          <button onClick={handleSave} disabled={isUploading} className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold cursor-pointer hover:bg-slate-800">
            {isUploading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}