import React, { useState, useEffect } from "react"; // useEffect 추가
import Sidebar from "./components/Sidebar";
import PostCard from "./components/PostCard";
import RightSidebar from "./components/RightSidebar";
import PostForm from "./components/PostForm";
import MediaViewer from "./components/MediaViewer";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

function App() {
  const [volume, setVolume] = useState(0.8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({ isOpen: false, list: [], index: 0, postId: null });
  const [posts, setPosts] = useState([]);

  // 데이터를 불러오는 공통 함수
  const fetchPosts = async () => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const loadedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPosts(loadedPosts);
  };

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async ({ content, mediaList }) => {
    try {
      await addDoc(collection(db, "posts"), {
        content: content,
        mediaList: mediaList,
        nickname: "행복한 슈글이",
        createdAt: new Date(),
      });
      console.log("데이터 저장 성공!");
      
      // [중요] 저장 성공 후 데이터를 다시 불러와 화면 갱신
      fetchPosts(); 
    } catch (error) {
      console.error("저장 실패: ", error);
    }
  };

  return (
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
              onOpenViewer={(idx) =>
                setViewer({
                  isOpen: true,
                  list: post.mediaList,
                  index: idx,
                  postId: post.id,
                })
              }
              onUpdateIndex={(idx) =>
                setPosts((prev) =>
                  prev.map((p) =>
                    p.id === post.id ? { ...p, lastIndex: idx } : p,
                  ),
                )
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
          onClose={(lastIdx) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === viewer.postId ? { ...p, lastIndex: lastIdx } : p,
              ),
            );
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
export default App;
