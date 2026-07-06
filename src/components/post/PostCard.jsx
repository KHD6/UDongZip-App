// src/components/post/PostCard.jsx
import React, { useRef, useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import { auth, db, storage } from "../../firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { useKeyPress } from "../../hooks/useKeyPress";
import { ref, deleteObject } from "firebase/storage";

function PostCard({
  nickname, email, photoURL, content, createdAt, mediaList,
  onOpenViewer, initialIndex, onUpdateIndex,
  onVisibilityChange = () => {},
  onHoverStateChange = () => {},
  isPlaying, uid, id, user_handle
}) {
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (!mediaList) return;
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (isPlaying && idx === currentIndex) {
        video.play().catch((e) => console.log("재생 실패:", e));
      } else {
        video.pause();
      }
    });
  }, [isPlaying, currentIndex, mediaList]);

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
        console.error("삭제 오류 상세:", error);
        alert(`삭제 중 오류 발생: ${error.message}`);
      }
    }
  };

  const handleOpenViewer = () => {
    if (onOpenViewer) {
      onOpenViewer(currentIndex, (lastIndex) => {
        setCurrentIndex(lastIndex);
        onUpdateIndex(lastIndex);
      });
    }
  };

  const handleUpdate = (newIdx) => {
    setCurrentIndex(newIdx);
    if (onUpdateIndex) onUpdateIndex(newIdx);
  };

  useKeyPress("ArrowLeft", () => currentIndex > 0 && handleUpdate(currentIndex - 1), isPlaying);
  useKeyPress("ArrowRight", () => currentIndex < mediaList.length - 1 && handleUpdate(currentIndex + 1), isPlaying);

  return (
    <article
      ref={cardRef}
      className="bg-white p-6 md:p-7 rounded-[32px] shadow-[0_12px_40px_rgba(194,155,124,0.05)] border border-slate-50 transition-all duration-300 hover:shadow-[0_16px_48px_rgba(194,155,124,0.08)] hover:-translate-y-[2px]"
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