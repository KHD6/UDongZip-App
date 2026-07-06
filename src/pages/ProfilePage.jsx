// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import MediaViewer from "../components/MediaViewer";
import EditProfileModal from "../components/EditProfileModal";

// Swiper 관련 import
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function ProfilePage() {
  const { uid } = useParams();
  const { fetchProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, postId: null, onClose: null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      const data = userDoc.exists() ? userDoc.data() : {};
      setUserData(data);

      const postsQuery = query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(postsQuery);
      
      const enrichedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        nickname: data.displayName || "집사",
        photoURL: data.photoURL || auth.currentUser?.photoURL || "/default-profile.png",
        user_handle: data.user_handle || ""
      }));
      setUserPosts(enrichedPosts);
    } catch (err) { console.error("데이터 로딩 실패:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [uid]);
  const allMediaList = userPosts.flatMap(post => (post.mediaList || []).map(media => ({ ...media, postId: post.id })));

  if (loading) return <div className="p-8 text-center text-slate-400">🐾 집사 정보를 불러오는 중...</div>;

  return (
    <div className="w-full max-w-[600px] mx-auto py-6 px-4 md:px-6">
      {/* 1. Swiper 적용된 펫 갤러리 */}
      <div className="mb-6">
        <Swiper
          slidesPerView="auto"
          spaceBetween={16}
          className="w-full"
        >
          {userData.pets?.map((pet, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <div className="flex flex-col items-center gap-2 group cursor-default">
                <div className="relative w-20 h-20 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm">
                  <img src={pet.photoURL} className="w-full h-full object-cover" alt={pet.name} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold truncate px-1">{pet.name}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          {(!userData.pets || userData.pets.length === 0) && auth.currentUser?.uid === uid && (
            <SwiperSlide className="!w-auto">
              <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => setIsEditModalOpen(true)}>
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs hover:border-slate-400 hover:text-slate-400 transition-colors">+</div>
                <span className="text-[11px] font-bold text-slate-400">등록</span>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* 프로필 정보 및 게시글 리스트는 동일 */}
      <div className="flex items-center justify-between mb-6">
        <img src={userData.photoURL || auth.currentUser?.photoURL || "/default-profile.png"} className="w-20 h-20 rounded-full object-cover shadow-sm border border-slate-100" alt="프로필" />
        {auth.currentUser?.uid === uid && (
          <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">프로필 편집</button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="font-bold text-lg text-slate-800">{userData.displayName || auth.currentUser?.displayName}</h1>
        <p className="text-sm text-slate-600 mt-1">{userData.bio || "반가워요! 우동집 집사입니다. 🐾"}</p>
      </div>

      <div className="flex border-b border-slate-100 mb-6">
        <button onClick={() => setActiveTab("feed")} className={`flex-1 py-3 text-sm font-bold cursor-pointer ${activeTab === "feed" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}>게시글</button>
        <button onClick={() => setActiveTab("media")} className={`flex-1 py-3 text-sm font-bold cursor-pointer ${activeTab === "media" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}>미디어</button>
      </div>

      {activeTab === "feed" ? (
        <div className="space-y-6">
          {userPosts.map(post => (
            <PostCard key={post.id} {...post} volume={volume} isPlaying={playingPostId === post.id} onVisibilityChange={(isVisible) => isVisible && setPlayingPostId(post.id)} onHoverStateChange={(isHovered) => setPlayingPostId(isHovered ? post.id : null)} onOpenViewer={(idx, onClose) => setViewer({ isOpen: true, list: post.mediaList || [], index: idx, postId: post.id, onClose })} onUpdateIndex={(idx) => setUserPosts(prev => prev.map(p => p.id === post.id ? {...p, lastIndex: idx} : p))} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {allMediaList.map((media, mIdx) => (
            <div key={mIdx} className="aspect-square bg-slate-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setViewer({ isOpen: true, list: allMediaList, index: mIdx, postId: media.postId })}>
              {media.type === "video" ? <video src={media.url} className="w-full h-full object-cover" /> : <img src={media.url} className="w-full h-full object-cover" alt="media" />}
            </div>
          ))}
        </div>
      )}

      {isEditModalOpen && <EditProfileModal userData={userData} uid={uid} onClose={() => setIsEditModalOpen(false)} onUpdate={async () => { await fetchData(); await fetchProfile(uid); }} />}
      {viewer.isOpen && <MediaViewer {...viewer} volume={volume} onVolumeChange={setVolume} onClose={() => setViewer({ ...viewer, isOpen: false })} />}
    </div>
  );
}