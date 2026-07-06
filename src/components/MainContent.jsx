// src/components/MainContent.jsx
import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

function MainContent({ refreshKey, onOpenWriteModal, setViewer, volume, setVolume }) {
  const [posts, setPosts] = useState([]);
  const [playingPostId, setPlayingPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const rawPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const userCache = {};
      const enrichedPosts = await Promise.all(rawPosts.map(async (post) => {
        if (!post.uid) return post;
        if (!userCache[post.uid]) {
          const userDocSnap = await getDoc(doc(db, "users", post.uid));
          userCache[post.uid] = userDocSnap.exists() ? userDocSnap.data() : null;
        }
        const userData = userCache[post.uid];
        return {
          ...post,
          nickname: userData?.displayName || post.nickname || "이름 없음",
          photoURL: userData?.photoURL || post.photoURL || "/default-profile.png",
          user_handle: userData?.user_handle || ""
        };
      }));
      setPosts(enrichedPosts);
    } catch (error) { console.error("데이터 로딩 실패:", error); }
  };

  useEffect(() => { const unsubscribe = auth.onAuthStateChanged(() => fetchPosts()); return () => unsubscribe(); }, []);
  useEffect(() => { if (refreshKey > 0) fetchPosts(); }, [refreshKey]);

  return (
    <div className="w-full">
      <div className="flex-1 p-4 md:p-6 space-y-8 min-w-0">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            volume={volume}
            isPlaying={playingPostId === post.id}
            onVisibilityChange={(isVisible) => { if (window.matchMedia("(pointer: coarse)").matches && isVisible) setPlayingPostId(post.id); }}
            onHoverStateChange={(isHovered) => { if (window.matchMedia("(pointer: fine)").matches) setPlayingPostId(isHovered ? post.id : null); }}
            onOpenViewer={(idx, onCloseCallback) =>
              setViewer({ isOpen: true, list: (post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), index: idx, onClose: onCloseCallback })
            }
            onUpdateIndex={(idx) => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, lastIndex: idx } : p))}
            onVolumeChange={setVolume}
          />
        ))}
      </div>
      <button onClick={onOpenWriteModal} className="md:hidden fixed bottom-25 right-6 z-[90] w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">+</button>
    </div>
  );
}

export default MainContent;