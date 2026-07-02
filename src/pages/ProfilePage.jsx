import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import PostCard from "../components/PostCard";

export default function ProfilePage() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 프로필 정보 가져오기
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) setProfile(userDoc.data());

        // 2. 사용자의 게시글만 가져오기
        const q = query(
          collection(db, "posts"),
          where("uid", "==", uid),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("프로필 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  if (loading) return <div className="p-4 text-center">불러오는 중...</div>;

  return (
    <div className="w-full max-w-[600px] mx-auto min-h-screen">
      {/* 프로필 헤더 */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <img 
            src={profile?.photoURL || "/default-avatar.png"} 
            alt="profile" 
            className="w-20 h-20 rounded-full bg-slate-200" 
          />
          <div>
            <h1 className="text-xl font-bold">{profile?.nickname || "알 수 없음"}</h1>
            <p className="text-slate-500 text-sm">게시글 {posts.length}개</p>
          </div>
        </div>
      </div>

      {/* 내 게시글 리스트 */}
      <div className="space-y-4 p-4">
        {posts.map(post => (
          <PostCard key={post.id} {...post} />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-10 text-slate-400">작성한 게시글이 없습니다.</div>
        )}
      </div>
    </div>
  );
}