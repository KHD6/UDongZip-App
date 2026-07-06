import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import { db, auth } from "../firebase";
import { collection, getDocs, query, orderBy, doc, getDoc, where } from "firebase/firestore";

function MainContent({ refreshKey, onOpenWriteModal, setViewer, volume, setVolume }) {
  const [posts, setPosts] = useState([]);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [activeTab, setActiveTab] = useState("recommend"); // "recommend" | "following"
  const [loading, setLoading] = useState(true);

  // 데이터 결합 로직 (유저 정보 + 게시글)
  const enrichPosts = async (rawPosts) => {
    const userCache = {};
    return await Promise.all(
      rawPosts.map(async (post) => {
        if (!post.uid) return post;
        if (!userCache[post.uid]) {
          const userDocSnap = await getDoc(doc(db, "users", post.uid));
          userCache[post.uid] = userDocSnap.exists() ? userDocSnap.data() : null;
        }
        const userData = userCache[post.uid];
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
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let q;
      if (activeTab === "recommend") {
        // 추천 탭: 전체 게시글 최신순
        q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      } else {
        // 팔로잉 탭: 내가 팔로우한 유저의 글만
        const myUid = auth.currentUser?.uid;
        if (!myUid) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // 1. 팔로우 목록 가져오기
        const followSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", myUid)));
        const followingIds = followSnap.docs.map(d => d.data().followingId);

        if (followingIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        // 2. 팔로우한 대상의 글만 쿼리 (Firestore 'in' 연산자는 최대 30개까지 지원)
        q = query(
          collection(db, "posts"), 
          where("uid", "in", followingIds.slice(0, 30)), 
          orderBy("createdAt", "desc")
        );
      }

      const snapshot = await getDocs(q);
      const rawPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const enriched = await enrichPosts(rawPosts);
      setPosts(enriched);
    } catch (error) {
      console.error("피드 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeTab, refreshKey]);

  return (
    <div className="w-full">
      {/* 상단 탭 내비게이션 (트위터 스타일) */}
      <div className="sticky top-0 z-30 flex bg-white/80 backdrop-blur-md border-b border-slate-100">
        <button
          onClick={() => setActiveTab("recommend")}
          className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer relative ${
            activeTab === "recommend" ? "text-slate-900" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          추천
          {activeTab === "recommend" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c29b7c] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer relative ${
            activeTab === "following" ? "text-slate-900" : "text-slate-400 hover:text-slate-50"
          }`}
        >
          팔로잉
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c29b7c] rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-8 min-w-0">
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">피드를 불러오는 중...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
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
                  list: (post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), 
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
          ))
        ) : (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <span className="text-4xl text-slate-200">🐾</span>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {activeTab === "following" 
                ? "팔로우한 집사가 없거나,\n새로운 소식이 아직 없어요." 
                : "추천할 게시글이 아직 없습니다."}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onOpenWriteModal}
        className="md:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
      >
        <Plus size={28} />
      </button>
    </div>
  );
}

export default MainContent;