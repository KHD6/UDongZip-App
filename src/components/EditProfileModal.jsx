// src/components/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, X } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

export default function EditProfileModal({ userData, uid, onClose, onUpdate }) {
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [bio, setBio] = useState(userData.bio || "");
  const [photoURL, setPhotoURL] = useState(userData.photoURL || "/default-profile.png");
  const [pets, setPets] = useState(userData.pets || []);
  const [isUploading, setIsUploading] = useState(false);
  const [focused, setFocused] = useState(null);
  
  const nameRef = useRef(null);
  const bioRef = useRef(null);
  const nameControls = useAnimation();
  const bioControls = useAnimation();
  const modalRef = useRef(null);

  const LIMIT_NAME = 20;
  const LIMIT_BIO = 160;

  // ESC 및 외부 클릭 닫기
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    const handleClickOutside = (e) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const triggerShake = async (controls, ref) => {
    await controls.start({ x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } });
    if (ref.current) ref.current.focus();
  };

  const handleSave = async () => {
    if (displayName.length > LIMIT_NAME) { triggerShake(nameControls, nameRef); return; }
    if (bio.length > LIMIT_BIO) { triggerShake(bioControls, bioRef); return; }
    
    setIsUploading(true);
    try {
      await updateDoc(doc(db, "users", uid), { displayName, bio, photoURL, pets });
      if (onUpdate) await onUpdate();
      onClose();
    } catch (err) { console.error("업데이트 실패:", err); } finally { setIsUploading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="cursor-pointer hover:bg-slate-100 p-1 rounded-full"><X size={20} /></button>
          <span className="font-bold text-sm">프로필 수정</span>
          <button onClick={handleSave} disabled={isUploading} className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer hover:bg-slate-800 transition-colors">저장</button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
          <div className="relative mt-8">
            <label className="absolute -top-12 left-4 w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-4 border-white shadow-md">
              <img src={photoURL} className="w-full h-full object-cover" alt="내 프로필" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera className="text-white" size={24} /></div>
              <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                const file = e.target.files[0]; if (!file) return;
                const storageRef = ref(storage, `users/${uid}/profile`);
                await uploadBytes(storageRef, file);
                setPhotoURL(await getDownloadURL(storageRef));
              }} />
            </label>
            
            <div className="space-y-4">
              <motion.div animate={nameControls} className={`border rounded-lg pl-2 ml-32 ${displayName.length > LIMIT_NAME ? "border-red-500" : focused === 'name' ? "border-blue-500" : "border-slate-200"}`}>
                <div className="flex justify-between px-1"><label className="text-xs text-slate-500 font-bold">닉네임</label><span className={`text-[10px] ${displayName.length > LIMIT_NAME ? "text-red-500" : "text-slate-400"}`}>{displayName.length}/{LIMIT_NAME}</span></div>
                <input ref={nameRef} className="w-full px-1 outline-none text-sm" value={displayName} onChange={(e) => setDisplayName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
              </motion.div>
              
              <motion.div animate={bioControls} className={`border rounded-lg p-2 ${bio.length > LIMIT_BIO ? "border-red-500" : focused === 'bio' ? "border-blue-500" : "border-slate-200"}`}>
                <div className="flex justify-between px-1"><label className="text-xs text-slate-500 font-bold">자기소개</label><span className={`text-[10px] ${bio.length > LIMIT_BIO ? "text-red-500" : "text-slate-400"}`}>{bio.length}/{LIMIT_BIO}</span></div>
                <textarea ref={bioRef} className="w-full px-1 outline-none text-sm h-16 resize-none" value={bio} onChange={(e) => setBio(e.target.value)} onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)} />
              </motion.div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2">반려동물 관리 <span className="text-slate-400">({pets.length})</span></h3>
            <div className="h-[250px] overflow-y-auto pr-2 space-y-3 mb-3">
              {pets.map((pet, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0 border">
                    <img src={pet.photoURL} className="w-full h-full object-cover" alt="pet" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      const storageRef = ref(storage, `pets/${uid}/${Date.now()}_${file.name}`);
                      const url = await getDownloadURL((await uploadBytes(storageRef, file)).ref);
                      const newPets = [...pets]; newPets[i].photoURL = url; setPets(newPets);
                    }} />
                  </label>
                  <input className="flex-1 p-2 bg-slate-50 rounded-lg text-sm outline-none" value={pet.name} onChange={(e) => {
                    const newPets = [...pets]; newPets[i].name = e.target.value; setPets(newPets);
                  }} />
                  <button onClick={() => setPets(pets.filter((_, idx) => idx !== i))} className="text-red-500 text-xs cursor-pointer hover:underline">삭제</button>
                </div>
              ))}
              <button onClick={() => setPets([...pets, { name: `새로운 펫 ${pets.length + 1}`, photoURL: "/default-profile.png" }])} className="w-full py-2 bg-slate-100 rounded-lg text-sm font-bold cursor-pointer hover:bg-slate-200 transition-colors">+ 펫 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}