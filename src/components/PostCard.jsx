// src/components/PostCard.jsx
import React, { useRef, useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import { auth, db, storage } from "../firebase";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import Comments from "./Comments";

function PostCard({
  nickname,
  email,
  photoURL,
  content,
  createdAt,
  mediaList,
  onOpenViewer,
  initialIndex,
  onUpdateIndex,
  onVisibilityChange,
  onHoverStateChange,
  isPlaying,
  uid,
  id,
}) {
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        // 1. Storage 파일 삭제
        if (mediaList && mediaList.length > 0) {
          for (const item of mediaList) {
            if (item.path) {
              await deleteObject(ref(storage, item.path)).catch(() => {});
            }
          }
        }

        const batch = writeBatch(db);

        // 2. 좋아요 삭제
        const likesQuery = query(
          collection(db, "likes"),
          where("postId", "==", id),
        );
        const likesSnapshot = await getDocs(likesQuery);
        likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

        // 3. 댓글 삭제
        const commentsQuery = query(
          collection(db, "comments"),
          where("postId", "==", id),
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        commentsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

        // 4. 게시글 삭제
        batch.delete(doc(db, "posts", id));

        await batch.commit(); // 한 번만 호출
        window.location.reload();
      } catch (error) {
        console.error("삭제 과정 오류 상세:", error);
        alert(`삭제 중 오류가 발생했습니다: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (!mediaList) return;
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      // !?수정된 내용?!: isPlaying이 정의되었으므로 이제 정상 작동합니다.
      if (isPlaying && idx === currentIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [isPlaying, currentIndex, mediaList]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onVisibilityChange(true);
        });
      },
      { threshold: 0.6 },
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [onVisibilityChange]);

  const displayName = nickname || "";
  const finalName =
    displayName !== "익명의 집사" && displayName !== ""
      ? displayName
      : email === "익명의 집사"
        ? "익명의 집사"
        : email?.split("@")[0];

  return (
    <article
      ref={cardRef}
      className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100"
      onMouseEnter={() => onHoverStateChange(true)}
      onMouseLeave={() => onHoverStateChange(false)}
    >
      <PostHeader
        nickname={finalName}
        photoURL={photoURL}
        isOwner={auth.currentUser?.uid === uid}
        onDelete={handleDelete}
        onEdit={() => alert("수정 기능 구현 예정")}
      />
      <PostBody
        content={content}
        mediaList={mediaList}
        currentIndex={currentIndex}
        videoRefs={videoRefs}
        onOpenViewer={onOpenViewer}
        onUpdateIndex={(idx) => {
          setCurrentIndex(idx);
          onUpdateIndex(idx);
        }}
      />
      <PostFooter createdAt={createdAt} postId={id} />
    </article>
  );
}
export default React.memo(PostCard);
