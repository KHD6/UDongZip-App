import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import MediaViewer from "./MediaViewer";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

function MainContent({ refreshKey, onOpenWriteModal }) {
  const [volume, setVolume] = useState(0.8);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, postId: null, onClose: null });
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const rawPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const userCache = {};
      
      const enrichedPosts = await Promise.all(
        rawPosts.map(async (post) => {
          if (!post.uid) return post;

          if (!userCache[post.uid]) {
            const userDocSnap = await getDoc(doc(db, "users", post.uid));
            if (userDocSnap.exists()) {
              userCache[post.uid] = userDocSnap.data();
            } else {
              userCache[post.uid] = null;
            }
          }

          const userData = userCache[post.uid];
          
          // 본인 작성 글일 때 Auth 객체 최후방 폴백 추가 (구글 프로필 완벽 방어)
          const isMe = auth.currentUser && auth.currentUser.uid === post.uid;
          const fallbackPhoto = isMe ? auth.currentUser.photoURL : null;

          return {
            ...post,
            nickname: userData?.displayName || post.nickname || (isMe ? auth.currentUser.displayName : "이름 없음"),
            photoURL: userData?.photoURL || post.photoURL || post.userPhotoURL || fallbackPhoto || "/default-profile.png",
            user_handle: userData?.user_handle || ""
          };
        })
      );

      setPosts(enrichedPosts);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => fetchPosts());
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (refreshKey > 0) fetchPosts();
  }, [refreshKey]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className="flex-1 p-4 md:p-6 space-y-8 min-w-0">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            initialIndex={post.lastIndex || 0}
            volume={volume}
            isPlaying={playingPostId === post.id}
            onVisibilityChange={(isVisible) => {
              if (window.matchMedia("(pointer: coarse)").matches && isVisible) setPlayingPostId(post.id);
            }}
            onHoverStateChange={(isHovered) => {
              if (window.matchMedia("(pointer: fine)").matches) setPlayingPostId(isHovered ? post.id : null);
            }}
            onOpenViewer={(idx, onCloseCallback) =>
              setViewer({ isOpen: true, list: post.mediaList || [], index: idx, postId: post.id, onClose: onCloseCallback })
            }
            onUpdateIndex={(idx) =>
              setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, lastIndex: idx } : p)))
            }
            onVolumeChange={setVolume}
          />
        ))}
      </div>

      <button
        onClick={onOpenWriteModal}
        className="md:hidden fixed bottom-25 right-6 z-[90] w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
      >
        <Plus size={28} />
      </button>

      {viewer.isOpen && (
        <MediaViewer
          mediaList={viewer.list}
          initialIndex={viewer.index}
          volume={volume}
          onVolumeChange={setVolume}
          onClose={(lastIndex) => {
            if (viewer.onClose) viewer.onClose(lastIndex);
            setViewer({ ...viewer, isOpen: false });
          }}
        />
      )}
    </div>
  );
}

export default MainContent;