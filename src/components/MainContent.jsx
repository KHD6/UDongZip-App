import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";
import PostForm from "./PostForm";
import MediaViewer from "./MediaViewer";
import { db, auth } from "../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  addDoc 
} from "firebase/firestore";

function MainContent() {
  const [volume, setVolume] = useState(0.8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({ 
    isOpen: false, 
    list: [], 
    index: 0, 
    postId: null, 
    onClose: null 
  });
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async ({ content, mediaList }) => {
    try {
      await addDoc(collection(db, "posts"), {
        content,
        mediaList,
        uid: auth.currentUser.uid,
        nickname: auth.currentUser.displayName || "익명의 집사",
        photoURL: auth.currentUser.photoURL || null,
        createdAt: new Date(),
      });
      fetchPosts();
    } catch (error) {
      console.error("저장 실패: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 relative">
      <div className="flex flex-col md:flex-row max-w-6xl mx-auto">
        <Sidebar onOpenModal={() => setIsModalOpen(true)} />

        <main className="flex-1 p-4 md:p-6 space-y-8 pt-14">
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
                setViewer({ 
                  isOpen: true, 
                  list: post.mediaList || [], 
                  index: idx, 
                  postId: post.id, 
                  onClose: onCloseCallback 
                })
              }
              onUpdateIndex={(idx) =>
                setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, lastIndex: idx } : p)))
              }
              onVolumeChange={setVolume}
            />
          ))}
        </main>

        <RightSidebar />
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[90] w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all active:scale-95"
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

      {isModalOpen && (
        <PostForm
          onSubmit={handleCreatePost}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}

export default MainContent;