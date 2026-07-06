// src/components/EditProfileModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { setDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, X, Trash2 } from "lucide-react";
import { motion, useAnimation } from "framer-motion";

export default function EditProfileModal({ userData, uid, onClose, onUpdate }) {
  const [displayName, setDisplayName] = useState(userData.displayName || "");
  const [bio, setBio] = useState(userData.bio || "");
  const [photoURL, setPhotoURL] = useState(userData.photoURL || auth.currentUser?.photoURL || "/default-profile.png");
  const [pets, setPets] = useState(userData.pets || []);
  const [isUploading, setIsUploading] = useState(false);
  const [focused, setFocused] = useState(null);

  const nameRef = useRef(null);
  const nameControls = useAnimation();
  const modalRef = useRef(null);
  const LIMIT_NAME = 20;

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleFileUpload = async (e, type, index = null) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      // 업로드 시에도 현재 로그인한 사용자의 UID를 사용하여 경로 지정
      const currentUid = auth.currentUser.uid;
      const path = type === 'profile' ? `users/${currentUid}/profile` : `pets/${currentUid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      if (type === 'profile') setPhotoURL(url);
      else {
        const newPets = [...pets];
        newPets[index].photoURL = url;
        setPets(newPets);
      }
    } catch (err) {
      console.error("업로드 실패:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (displayName.length > LIMIT_NAME) {
      await nameControls.start({ x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } });
      if (nameRef.current) nameRef.current.focus();
      return;
    }

    setIsUploading(true);
    try {
      // ❗ 수동 체크 로직 제거: 보안 규칙이 서버에서 처리함
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      await setDoc(userRef, {
        displayName,
        bio,
        photoURL,
        pets: pets.map(p => ({
          name: p.name || "",
          species: p.species || "",
          birthday: p.birthday || "",
          photoURL: p.photoURL || "/default-profile.png"
        }))
      }, { merge: true });
      
      if (onUpdate) await onUpdate();
      onClose();
    } catch (err) { 
      console.error("저장 실패:", err);
      alert("저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div 
        ref={modalRef} 
        className="bg-[#fdfbf7] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/50"
      >
        <div className="flex items-center justify-between p-6 border-b border-orange-100 bg-white/50">
          <button onClick={onClose} className="cursor-pointer hover:bg-white p-2 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
          <span className="font-black text-slate-800 tracking-tight">프로필 및 펫 관리</span>
          <button 
            onClick={handleSave} 
            disabled={isUploading} 
            className="bg-[#c29b7c] text-white px-6 py-2 rounded-full text-sm font-black cursor-pointer hover:bg-[#b08968] transition-all shadow-md shadow-orange-900/20 disabled:opacity-50"
          >
            {isUploading ? "처리 중..." : "저장"}
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 scrollbar-hide">
          <div className="flex flex-col items-center">
            <label className="relative w-28 h-24 rounded-[32px] overflow-hidden cursor-pointer group border-4 border-white shadow-lg bg-white">
              <img src={photoURL} className="w-full h-full object-cover" alt="profile" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile')} />
            </label>
          </div>

          <div className="space-y-4">
            <motion.div 
              animate={nameControls} 
              className={`bg-white rounded-2xl p-4 border-2 transition-all ${focused === 'name' ? "border-[#c29b7c] shadow-inner" : "border-white"}`}
            >
              <div className="flex justify-between mb-1">
                <label className="text-[10px] font-black text-[#c29b7c] uppercase">닉네임</label>
                <span className={`text-[10px] ${displayName.length > LIMIT_NAME ? "text-red-500" : "text-slate-300"}`}>
                  {displayName.length}/{LIMIT_NAME}
                </span>
              </div>
              <input 
                ref={nameRef} 
                className="w-full outline-none text-sm font-bold text-slate-700 bg-transparent" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                onFocus={() => setFocused('name')} 
                onBlur={() => setFocused(null)} 
              />
            </motion.div>
            
            <div className={`bg-white rounded-2xl p-4 border-2 transition-all ${focused === 'bio' ? "border-[#c29b7c] shadow-inner" : "border-white"}`}>
              <label className="text-[10px] font-black text-[#c29b7c] uppercase block mb-1">자기소개</label>
              <textarea 
                className="w-full outline-none text-sm font-bold text-slate-700 bg-transparent h-20 resize-none" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                onFocus={() => setFocused('bio')} 
                onBlur={() => setFocused(null)} 
              />
            </div>
          </div>

          <div className="pt-2 border-t border-orange-50">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
                우리 아이들 <span className="bg-[#c29b7c]/10 text-[#c29b7c] px-2 py-0.5 rounded-full text-[10px]">{pets.length}</span>
              </h3>
              <button 
                onClick={() => setPets([...pets, { name: "", species: "", birthday: "", photoURL: "/default-profile.png" }])} 
                className="flex items-center gap-1 text-xs font-black text-[#c29b7c] cursor-pointer hover:bg-white px-3 py-1 rounded-full transition-all"
              >
                + 추가
              </button>
            </div>
            
            <div className="space-y-4">
              {pets.map((pet, i) => (
                <div key={i} className="bg-white rounded-[24px] p-4 shadow-sm border border-orange-50 relative group/item">
                  <button 
                    onClick={() => setPets(pets.filter((_, idx) => idx !== i))} 
                    className="absolute top-4 right-4 text-slate-200 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex gap-4">
                    <label className="w-16 h-16 rounded-[20px] overflow-hidden cursor-pointer flex-shrink-0 border-2 border-[#fdfbf7] shadow-sm relative group">
                      <img src={pet.photoURL} className="w-full h-full object-cover" alt="pet" />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera className="text-white" size={18} />
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'pet', i)} />
                    </label>
                    <div className="flex-1 space-y-2">
                      <input 
                        placeholder="아이 이름" 
                        className="w-full bg-[#fdfbf7] rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-[#c29b7c]/30" 
                        value={pet.name} 
                        onChange={(e) => { const n = [...pets]; n[i].name = e.target.value; setPets(n); }} 
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder="종족" 
                          className="flex-1 bg-[#fdfbf7] rounded-xl px-3 py-2 text-[11px] font-bold outline-none" 
                          value={pet.species} 
                          onChange={(e) => { const n = [...pets]; n[i].species = e.target.value; setPets(n); }} 
                        />
                        <input 
                          type="date" 
                          className="flex-1 bg-[#fdfbf7] rounded-xl px-3 py-2 text-[11px] font-bold outline-none text-slate-500" 
                          value={pet.birthday} 
                          onChange={(e) => { const n = [...pets]; n[i].birthday = e.target.value; setPets(n); }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}