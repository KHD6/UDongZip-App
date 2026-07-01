import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import RightSidebar from "./RightSidebar";
import MediaViewer from "./MediaViewer";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

function MainContent({ refreshKey, onOpenWriteModal }) { // 🌟 부모에게 제어권 수령
  const [volume, setVolume] = useState(0.8);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [viewer, setViewer] = useState({
    isOpen: false,
    list: [],
    index: 0,
    postId: null,
    onClose: null,
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

  // 1. 인증 상태 변경 감지 리스너
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchPosts();
    });
    return () => unsubscribe();
  }, []);

  // 2. 🌟 글로벌 글쓰기가 완료되었을 때 피드만 갱신하는 트리거 리스너
  useEffect(() => {
    if (refreshKey > 0) {
      fetchPosts();
    }
  }, [refreshKey]);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6">
      
      {/* 중앙 타임라인 피드 섹션 (시맨틱 마크업을 위해 div로 세분화) */}
      <div className="flex-1 p-4 md:p-6 space-y-8 min-w-0">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            initialIndex={post.lastIndex || 0}
            volume={volume}
            isPlaying={playingPostId === post.id}
            onVisibilityChange={(isVisible) => {
              if (window.matchMedia("(pointer: coarse)").matches && isVisible)
                setPlayingPostId(post.id);
            }}
            onHoverStateChange={(isHovered) => {
              if (window.matchMedia("(pointer: fine)").matches)
                setPlayingPostId(isHovered ? post.id : null);
            }}
            onOpenViewer={(idx, onCloseCallback) =>
              setViewer({
                isOpen: true,
                list: post.mediaList || [],
                index: idx,
                postId: post.id,
                onClose: onCloseCallback,
              })
            }
            onUpdateIndex={(idx) =>
              setPosts((prev) =>
                prev.map((p) =>
                  p.id === post.id ? { ...p, lastIndex: idx } : p,
                ),
              )
            }
            onVolumeChange={setVolume}
          />
        ))}
      </div>

      {/* 우측 트렌딩 광고 레이아웃 */}
      <RightSidebar />

      {/* 모바일 전용 플로팅 글쓰기 버튼 - 부모 공통 팝업 함수로 연동 */}
      <button
        onClick={onOpenWriteModal}
        className="md:hidden fixed bottom-25 right-6 z-[90] w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all active:scale-95"
      >
        <Plus size={28} />
      </button>

      {/* 전체 화면 미디어 뷰어 */}
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