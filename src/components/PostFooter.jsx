import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import Comments from "./Comments";
import RelativeTime from "./RelativeTime";

export default function PostFooter({ postId, createdAt }) {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const isLiked = likes.find((like) => like.uid === auth.currentUser?.uid);

  // 좋아요 구독
  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, "likes"), where("postId", "==", postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [postId]);

  // 댓글 구독
  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, "comments"), where("postId", "==", postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [postId]);

  const toggleLike = async () => {
    try {
      if (isLiked) {
        await deleteDoc(doc(db, "likes", isLiked.id));
      } else {
        await addDoc(collection(db, "likes"), {
          postId,
          uid: auth.currentUser.uid,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between -4 pt-4 border-t border-slate-100">
        <div className="flex gap-4">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            {isLiked ? "❤️" : "🤍"}
            <span className="text-sm text-slate-500">{likes.length}</span>
          </button>

          <button
            onClick={() => setIsCommentOpen(true)}
            className="flex items-center gap-1 cursor-pointer"
          >
            💬{" "}
            {comments.length > 0 && (
              <span className="text-sm text-slate-500">{comments.length}</span>
            )}
          </button>
        </div>

        <div className="py-2">
          <RelativeTime createdAt={createdAt} />
        </div>
      </div>

      {/* 댓글 모달 */}
      {isCommentOpen && (
        <Comments postId={postId} onClose={() => setIsCommentOpen(false)} />
      )}
    </>
  );
}
