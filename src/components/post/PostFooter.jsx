// src/components/post/PostFooter.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import Comments from "../comment/Comments";
import RelativeTime from "../common/RelativeTime";

export default function PostFooter({ postId, createdAt }) {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  const isLiked = likes.find((like) => like.uid === auth.currentUser?.uid);

  useEffect(() => {
    if (!postId) return;
    const q = query(collection(db, "likes"), where("postId", "==", postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLikes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [postId]);

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
      <div className="flex justify-between items-center pt-4 border-t border-slate-100/60 mt-4 px-1">
        <div className="flex gap-4">
          <button
            onClick={toggleLike}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer text-xs font-bold text-slate-600"
          >
            <span>{isLiked ? "❤️" : "🤍"}</span>
            <span>{likes.length}</span>
          </button>

          <button
            onClick={() => setIsCommentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer text-xs font-bold text-slate-600"
          >
            <span>💬</span>
            {comments.length > 0 && <span>{comments.length}</span>}
          </button>
        </div>

        <div>
          <RelativeTime createdAt={createdAt} />
        </div>
      </div>

      {isCommentOpen && (
        <Comments postId={postId} onClose={() => setIsCommentOpen(false)} />
      )}
    </>
  );
}