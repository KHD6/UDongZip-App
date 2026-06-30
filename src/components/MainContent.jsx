import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";
import PostForm from "./PostForm";
import MediaViewer from "./MediaViewer";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { AuthProvider } from "../context/AuthContext";

function MainContent() {
  const [volume, setVolume] = useState(0.8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, postId: null, onClose: null });
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const loadedPosts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPosts(loadedPosts);
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
    <div className="App">
      <div className="min-h-screen bg-[#fdfbf7] text-slate-800">
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto">
          <Sidebar onOpenModal={() => setIsModalOpen(true)} />
          <main className="flex-1 p-4 md:p-6 space-y-8 pt-14">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                initialIndex={post.lastIndex}
                volume={volume}
                onVisibilityChange={(isVisible) => {
                  const isTouch = window.matchMedia("(pointer: coarse)").matches;
                  if (isTouch && isVisible) setPlayingPostId(post.id);
                }}
                onHoverStateChange={(isHovered) => {
                  const isMouse = window.matchMedia("(pointer: fine)").matches;
                  if (isMouse) setPlayingPostId(isHovered ? post.id : null);
                }}
                onOpenViewer={(idx, onCloseCallback) =>
                  setViewer({ isOpen: true, list: post.mediaList, index: idx, postId: post.id, onClose: onCloseCallback })
                }
                onUpdateIndex={(idx) =>
                  setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, lastIndex: idx } : p)))
                }
                isPlaying={playingPostId === post.id}
                onVolumeChange={setVolume}
              />
            ))}
          </main>
          <RightSidebar />
        </div>

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
        {isModalOpen && <PostForm onSubmit={handleCreatePost} onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
}

export default MainContent;