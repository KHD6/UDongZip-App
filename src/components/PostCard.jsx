// src/components/PostCard.jsx
import React, { useRef, useEffect, useState } from "react";
import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import { auth, db, storage } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";
import { useKeyPress } from "../hooks/useKeyPress";
import { ref, deleteObject } from "firebase/storage";

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
  onVisibilityChange = () => {},
  onHoverStateChange = () => {},
  isPlaying,
  uid,
  id,
  user_handle,
}) {
  const cardRef = useRef(null);
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (!mediaList) return;

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;

      if (isPlaying && idx === currentIndex) {
        // play()는 프로미스를 반환하므로 예외를 잡아주어야 합니다.
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {}) // 재생 성공 시
            .catch((error) => {
              // 중단된 재생 요청은 무시하거나 로그만 남김
              console.log("자동 재생 대기 중 중단됨:", error.message);
            });
        }
      } else {
        // 이미 멈춰있는 영상에 pause()를 호출하지 않도록 조건 추가
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [isPlaying, currentIndex, mediaList]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        if (mediaList?.length > 0) {
          for (const item of mediaList) {
            if (item.path)
              await deleteObject(ref(storage, item.path)).catch(() => {});
          }
        }
        const batch = writeBatch(db);

        // 1. 좋아요 삭제
        const likesSnapshot = await getDocs(
          query(collection(db, "likes"), where("postId", "==", id)),
        );
        likesSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

        // 2. 댓글 삭제
        const commentsSnapshot = await getDocs(
          query(collection(db, "comments"), where("postId", "==", id)),
        );
        commentsSnapshot.forEach((docSnap) => batch.delete(docSnap.ref));

        // 3. 게시글 삭제 (문법 수정)
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

  useKeyPress(
    "ArrowLeft",
    () => currentIndex > 0 && handleUpdate(currentIndex - 1),
    isPlaying,
  );
  useKeyPress(
    "ArrowRight",
    () => currentIndex < mediaList.length - 1 && handleUpdate(currentIndex + 1),
    isPlaying,
  );

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
