// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import MediaViewer from "../components/MediaViewer";
import EditProfileModal from "../components/EditProfileModal";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export default function ProfilePage({ setViewer, volume, setVolume }) {
  const { uid } = useParams();
  const { fetchProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);

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

  // 미디어 탭을 위한 전체 미디어 리스트 구성
  const allMediaList = userPosts.flatMap(post => 
    (post.mediaList || []).map(media => ({ ...media, type: media.type || 'image', postId: post.id }))
  );

  if (loading) return <div className="p-8 text-center text-slate-400">🐾 집사 정보를 불러오는 중...</div>;
  if (!userData && !loading) return <div className="p-8 text-center text-slate-400">존재하지 않는 집사입니다.</div>;

  return (
    <div className="w-full max-w-[600px] mx-auto py-6 px-4 md:px-6">
      {/* 1. 상단 펫 갤러리 */}
      <div className="mb-6">
        <Swiper slidesPerView="auto" spaceBetween={16} className="w-full">
          {userData.pets?.map((pet, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <div className="flex flex-col items-center gap-2 group cursor-pointer" 
                   onClick={() => setViewer({ isOpen: true, list: userData.pets.map(p => ({ type: 'image', url: p.photoURL, name: p.name })), index: index, onClose: null })}>
                <div className="relative w-20 h-20 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
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

      {/* 2. 프로필 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <img 
          src={userData.photoURL || auth.currentUser?.photoURL || "/default-profile.png"} 
          className="w-20 h-20 rounded-full object-cover shadow-sm border border-slate-100 cursor-pointer" 
          alt="프로필" 
          onClick={() => setViewer({ isOpen: true, list: [{ type: 'image', url: userData.photoURL || auth.currentUser?.photoURL || "/default-profile.png" }], index: 0, onClose: null })}
        />
        {auth.currentUser?.uid === uid && (
          <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors">프로필 편집</button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="font-bold text-lg text-slate-800">{userData.displayName || auth.currentUser?.displayName}</h1>
        <p className="text-sm text-slate-600 mt-1">{userData.bio || "반가워요! 우동집 집사입니다. 🐾"}</p>
      </div>

      {/* 3. 탭 */}
      <div className="flex border-b border-slate-100 mb-6">
        <button onClick={() => setActiveTab("feed")} className={`flex-1 py-3 text-sm font-bold cursor-pointer ${activeTab === "feed" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}>게시글</button>
        <button onClick={() => setActiveTab("media")} className={`flex-1 py-3 text-sm font-bold cursor-pointer ${activeTab === "media" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}>미디어</button>
      </div>

      {/* 4. 컨텐츠 */}
      {activeTab === "feed" ? (
        <div className="space-y-6">
          {userPosts.map(post => (
            <PostCard 
              key={post.id} {...post}
              volume={volume}
              isPlaying={playingPostId === post.id}
              onVisibilityChange={(isVisible) => isVisible && setPlayingPostId(post.id)}
              onHoverStateChange={(isHovered) => setPlayingPostId(isHovered ? post.id : null)}
              onOpenViewer={(idx, onClose) => setViewer({ isOpen: true, list: (post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), index: idx, postId: post.id, onClose })}
              onUpdateIndex={(idx) => setUserPosts(prev => prev.map(p => p.id === post.id ? {...p, lastIndex: idx} : p))}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {allMediaList.map((media, mIdx) => (
            <div key={mIdx} className="aspect-square bg-slate-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" 
                 onClick={() => setViewer({ isOpen: true, list: allMediaList, index: mIdx, postId: media.postId, onClose: null })}>
              {media.type === "video" ? <video src={media.url} className="w-full h-full object-cover" /> : <img src={media.url} className="w-full h-full object-cover" alt="media" />}
            </div>
          ))}
        </div>
      )}

      {isEditModalOpen && <EditProfileModal userData={userData} uid={uid} onClose={() => setIsEditModalOpen(false)} onUpdate={async () => { await fetchData(); await fetchProfile(uid); }} />}
    </div>
  );
}