import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import PostCard from "./components/PostCard";
import RightSidebar from "./components/RightSidebar";
import PostForm from "./components/PostForm";
import MediaViewer from "./components/MediaViewer";

function App() {
  const [volume, setVolume] = useState(0.8); // 기본 볼륨 80%
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({
    isOpen: false,
    list: [],
    index: 0,
    postId: null,
  });

  const [posts, setPosts] = useState([{}]);

  const handleCreatePost = ({ content, mediaList }) => {
    const newPost = {
      id: Date.now(),
      nickname: "새로운 작성자",
      content,
      mediaList,
      lastIndex: 0,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-100 pb-16 md:pb-0">
      <Sidebar onOpenModal={() => setIsModalOpen(true)} />
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4 pt-14">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            nickname={post.nickname}
            content={post.content}
            mediaList={post.mediaList}
            initialIndex={post.lastIndex}
            volume={volume}
            onVisibilityChange={(isVisible) => {
              // 모바일/태블릿에서는 스크롤 위치로 자동 재생
              const isTouch = window.matchMedia("(pointer: coarse)").matches;
              if (isTouch && isVisible) setPlayingPostId(post.id);
            }}
            onHoverStateChange={(isHovered) => {
              // PC(마우스)에서는 hover 시점에만 재생
              const isMouse = window.matchMedia("(pointer: fine)").matches;
              if (isMouse) {
                setPlayingPostId(isHovered ? post.id : null);
              }
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

      {viewer.isOpen && (
        <MediaViewer
          mediaList={viewer.list}
          initialIndex={viewer.index}
          volume={volume}
          onVolumeChange={(val) => setVolume(val)}
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
      <RightSidebar />
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
