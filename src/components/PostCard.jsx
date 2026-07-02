import React, { useRef, useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import { auth, db, storage } from "../firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useKeyPress } from "../hooks/useKeyPress";

function PostCard({
  nickname, email, photoURL, content, createdAt, mediaList,
  onOpenViewer, initialIndex, onUpdateIndex,
  onVisibilityChange, onHoverStateChange, isPlaying, uid, id, user_handle
}) {
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    console.log("isPlaying:", isPlaying, "currentIndex:", currentIndex);
    if (!mediaList) return;
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (isPlaying && idx === currentIndex) {
        console.log("영상 재생 시도");
        video.play().catch((e) => console.log("재생 실패:", e));
      } else {
        video.pause();
      }
    });
  }, [isPlaying, currentIndex, mediaList]);

  // 1. handleDelete 함수를 가장 먼저 선언
  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        if (mediaList?.length > 0) {
          for (const item of mediaList) {
            if (item.path) await deleteObject(ref(storage, item.path)).catch(() => {});
          }
        }
        const batch = writeBatch(db);
        const likesSnapshot = await getDocs(query(collection(db, "likes"), where("postId", "==", id)));
        likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));
        
        const commentsSnapshot = await getDocs(query(collection(db, "comments"), where("postId", "==", id)));
        commentsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

        batch.delete(doc(db, "posts", id));
        await batch.commit();
        window.location.reload();
      } catch (error) {
        alert(`삭제 중 오류 발생: ${error.message}`);
      }
    }
  };

  // 2. 뷰어 핸들러
  const handleOpenViewer = () => {
    onOpenViewer(currentIndex, (lastIndex) => {
      setCurrentIndex(lastIndex);
      onUpdateIndex(lastIndex);
    });
  };

  const handleUpdate = (newIdx) => {
    setCurrentIndex(newIdx);
    onUpdateIndex(newIdx);
  };

  // 3. 키보드 훅
  useKeyPress("ArrowLeft", () => currentIndex > 0 && handleUpdate(currentIndex - 1), isPlaying);
  useKeyPress("ArrowRight", () => currentIndex < mediaList.length - 1 && handleUpdate(currentIndex + 1), isPlaying);

  return (
    <article
      ref={cardRef}
      className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100"
      onMouseEnter={() => onHoverStateChange(true)}
      onMouseLeave={() => onHoverStateChange(false)}
    >
      <PostHeader 
        nickname={nickname} 
        photoURL={photoURL} 
        isOwner={auth.currentUser?.uid === uid} 
        onDelete={handleDelete}
        uid={uid}
        user_handle={user_handle}
      />
      <PostBody
        content={content}
        mediaList={mediaList}
        currentIndex={currentIndex}
        videoRefs={videoRefs}
        onOpenViewer={handleOpenViewer}
        onUpdateIndex={handleUpdate}
      />
      <PostFooter createdAt={createdAt} postId={id} />
    </article>
  );
}

export default React.memo(PostCard);