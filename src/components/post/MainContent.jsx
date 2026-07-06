// src/components/post/MainContent.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import { db, auth } from "../../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  getDoc, 
  where, 
  limit, 
  startAfter 
} from "firebase/firestore";

export default function MainContent({ refreshKey, onOpenWriteModal, setViewer, volume, setVolume, isNavVisible }) {
  const PAGE_SIZE = 5; // 한 페이지당 로드할 게시글 개수
  
  const [posts, setPosts] = useState([]);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [activeTab, setActiveTab] = useState("recommend"); // "recommend" | "following"
  
  // 무한 스크롤 상태
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // 데스크톱 전용 탭바 스크롤 반응형 상태
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const observerRef = useRef();

  // 데스크톱 전용 탭바 스크롤 감지 리스너 (768px 이상 분기 적용)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (window.innerWidth >= 768) {
        if (currentScrollY <= 50) {
          setIsTabVisible(true);
        } else if (currentScrollY > lastScrollY) {
          setIsTabVisible(false); // 스크롤 내릴 때: 탭바 슬라이드 업 (숨김)
        } else {
          setIsTabVisible(true);  // 스크롤 올릴 때: 탭바 슬라이드 다운 (노출)
        }
      } else {
        // 모바일 환경은 전역 제어로 동작하므로 트래킹 상태 고정
        setIsTabVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 유저 정보 결합(Enrich) 유틸 함수
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

  // 피드 호출 엔진
  const fetchPosts = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let q;
      const myUid = auth.currentUser?.uid;

      if (activeTab === "recommend") {
        if (isInitial) {
          q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
        } else {
          if (!lastVisible) return;
          q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(PAGE_SIZE));
        }
      } else {
        if (!myUid) {
          setPosts([]);
          setHasMore(false);
          setLoading(false);
          setLoadingMore(false);
          return;
        }

        const followSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", myUid)));
        const followingIds = followSnap.docs.map(d => d.data().followingId);

        if (followingIds.length === 0) {
          setPosts([]);
          setHasMore(false);
          setLoading(false);
          setLoadingMore(false);
          return;
        }

        if (isInitial) {
          q = query(
            collection(db, "posts"), 
            where("uid", "in", followingIds.slice(0, 30)), 
            orderBy("createdAt", "desc"), 
            limit(PAGE_SIZE)
          );
        } else {
          if (!lastVisible) return;
          q = query(
            collection(db, "posts"), 
            where("uid", "in", followingIds.slice(0, 30)), 
            orderBy("createdAt", "desc"), 
            startAfter(lastVisible), 
            limit(PAGE_SIZE)
          );
        }
      }

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        if (isInitial) setPosts([]);
      } else {
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(snapshot.docs.length === PAGE_SIZE);

        const rawPosts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const enriched = await enrichPosts(rawPosts);

        if (isInitial) {
          setPosts(enriched);
        } else {
          setPosts(prev => [...prev, ...enriched]);
        }
      }
    } catch (error) {
      console.error("피드 로딩 실패:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 무한 스크롤 감지 센서
  const lastPostElementRef = useCallback((node) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchPosts(false);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, lastVisible]);

  useEffect(() => {
    setLastVisible(null);
    setHasMore(true);
    setPosts([]);
    fetchPosts(true);
  }, [activeTab, refreshKey]);

  return (
    <div className="w-full">
      {/* 
        ❗ 모바일/PC 레이아웃 왜곡 완벽 정돈 최종본
        - 모바일: isNavVisible에 따라 'top-[52px]'과 'top-0'을 정밀 타겟팅하여 가림 현상 완벽 방어
        - 데스크톱(md): 'md:top-0' 및 'md:translate-y' 슬라이드 트랜지션만 독립적으로 타겟팅하여 충돌 방지
      */}
      <div 
        className={`sticky z-30 flex bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${
          isNavVisible ? "top-[52px] md:top-0" : "top-0 md:top-0"
        } ${
          isTabVisible ? "md:translate-y-0" : "md:-translate-y-full"
        }`}
      >
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
            activeTab === "following" ? "text-slate-900" : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          팔로잉
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c29b7c] rounded-full" />
          )}
        </button>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-2 min-w-0">
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">피드를 불러오는 중...</div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => {
            const isLastElement = posts.length === index + 1;
            return (
              <div ref={isLastElement ? lastPostElementRef : null} key={post.id}>
                <PostCard
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
              </div>
            );
          })
        ) : (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <span className="text-4xl text-slate-200">🐾</span>
            <p className="text-slate-400 text-sm font-medium leading-relaxed whitespace-pre-line">
              {activeTab === "following" 
                ? "팔로우한 집사가 없거나,\n새로운 소식이 아직 없어요." 
                : "추천할 게시글이 아직 없습니다."}
            </p>
          </div>
        )}

        {loadingMore && (
          <div className="py-6 text-center text-slate-400 font-bold text-xs animate-pulse">
            🐾 다음 소식 읽어오는 중...
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