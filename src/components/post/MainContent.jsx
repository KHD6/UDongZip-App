// src/components/post/MainContent.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import PostCard from "./PostCard";
import { db, auth } from "../../firebase";
import { useViewer } from "../../context/ViewerContext"; // 경로 수정
import { 
  collection, getDocs, query, orderBy, doc, getDoc, where, limit, startAfter 
} from "firebase/firestore";

export default function MainContent({ refreshKey, onOpenWriteModal, isNavVisible }) {
  const { openViewer, volume, setVolume } = useViewer();
  const PAGE_SIZE = 5;
  
  const [posts, setPosts] = useState([]);
  const [playingPostId, setPlayingPostId] = useState(null);
  const [activeTab, setActiveTab] = useState("recommend");
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const observerRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth >= 768) setIsTabVisible(currentScrollY <= 50 || currentScrollY < lastScrollY);
      else setIsTabVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const enrichPosts = async (rawPosts) => {
    const userCache = {};
    return await Promise.all(rawPosts.map(async (post) => {
      if (!post.uid) return post;
      if (!userCache[post.uid]) {
        const userDocSnap = await getDoc(doc(db, "users", post.uid));
        userCache[post.uid] = userDocSnap.exists() ? userDocSnap.data() : null;
      }
      const userData = userCache[post.uid];
      return {
        ...post,
        nickname: userData?.displayName || post.nickname || "집사",
        photoURL: userData?.photoURL || post.photoURL || "/default-profile.png",
        user_handle: userData?.user_handle || ""
      };
    }));
  };

  const fetchPosts = async (isInitial = true) => {
    if (isInitial) setLoading(true); else setLoadingMore(true);
    try {
      let q;
      const myUid = auth.currentUser?.uid;
      if (activeTab === "recommend") {
        q = isInitial ? query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(PAGE_SIZE)) : query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(PAGE_SIZE));
      } else {
        if (!myUid) { setPosts([]); setLoading(false); return; }
        const followSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", myUid)));
        const ids = followSnap.docs.map(d => d.data().followingId);
        if (ids.length === 0) { setPosts([]); setLoading(false); return; }
        q = isInitial ? query(collection(db, "posts"), where("uid", "in", ids.slice(0, 30)), orderBy("createdAt", "desc"), limit(PAGE_SIZE)) : query(collection(db, "posts"), where("uid", "in", ids.slice(0, 30)), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(PAGE_SIZE));
      }
      const snapshot = await getDocs(q);
      if (snapshot.empty) { setHasMore(false); if (isInitial) setPosts([]); }
      else {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        const enriched = await enrichPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPosts(prev => isInitial ? enriched : [...prev, ...enriched]);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); setLoadingMore(false); }
  };

  const lastPostElementRef = useCallback((node) => {
    if (loading || loadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) fetchPosts(false); });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, lastVisible]);

  useEffect(() => { setPosts([]); fetchPosts(true); }, [activeTab, refreshKey]);

  return (
    <div className="w-full">
      <div className={`sticky z-30 flex bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300 ${isNavVisible ? "top-[52px] md:top-0" : "top-0 md:top-0"} ${isTabVisible ? "md:translate-y-0" : "md:-translate-y-full"}`}>
        <button onClick={() => setActiveTab("recommend")} className={`flex-1 py-4 text-sm font-bold cursor-pointer relative ${activeTab === "recommend" ? "text-slate-900" : "text-slate-400"}`}>추천{activeTab === "recommend" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c29b7c] rounded-full" />}</button>
        <button onClick={() => setActiveTab("following")} className={`flex-1 py-4 text-sm font-bold cursor-pointer relative ${activeTab === "following" ? "text-slate-900" : "text-slate-400"}`}>팔로잉{activeTab === "following" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#c29b7c] rounded-full" />}</button>
      </div>
      <div className="flex-1 p-4 md:p-6 space-y-2 min-w-0">
        {posts.map((post, index) => (
          <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={post.id}>
            <PostCard {...post} volume={volume} isPlaying={playingPostId === post.id} onVisibilityChange={(v) => v && setPlayingPostId(post.id)} onHoverStateChange={(h) => setPlayingPostId(h ? post.id : null)} onOpenViewer={(idx, onClose) => openViewer((post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), idx, onClose)} onUpdateIndex={(idx) => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, lastIndex: idx } : p))} onVolumeChange={setVolume} />
          </div>
        ))}
        {loadingMore && <div className="py-6 text-center text-xs font-bold animate-pulse">🐾 다음 소식 읽어오는 중...</div>}
      </div>
      <button onClick={onOpenWriteModal} className="md:hidden fixed bottom-24 right-6 z-40 w-14 h-14 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">+</button>
    </div>
  );
}