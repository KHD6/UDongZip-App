import React, { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, auth } from "../firebase";
import CommentItem from "./CommentItem";

export default function Comments({ postId, onClose }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [expandedParents, setExpandedParents] = useState({});
  const inputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const targetParentId = replyTo ? (replyTo.parentId || replyTo.id) : null;
      await addDoc(collection(db, "comments"), {
        postId,
        text,
        parentId: targetParentId,
        uid: auth.currentUser.uid,
        nickname: auth.currentUser.displayName || "익명의 집사",
        photoURL: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setText("");
      setReplyTo(null);
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    }
  };

  const handleReplyClick = (comment) => {
    const targetParent = comment.parentId ? comments.find((c) => c.id === comment.parentId) : comment;
    setReplyTo(targetParent);
    setText(`@${comment.nickname} `);
    inputRef.current?.focus();
  };

  const parentComments = comments.filter((c) => !c.parentId);

  return (
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center">
      <div className="bg-white w-full h-[95vh] sm:h-[80vh] sm:max-w-lg sm:rounded-2xl flex flex-col overflow-hidden transition-all">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="font-bold text-slate-700">댓글</h3>
          <button onClick={onClose} className="text-slate-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {parentComments.map((parent) => {
            const replies = comments.filter((r) => r.parentId === parent.id);
            const isExpanded = expandedParents[parent.id];

            return (
              <div key={parent.id} className="space-y-4">
                <CommentItem comment={parent} onReply={handleReplyClick} isReply={false} />
                
                {replies.length > 0 && (
                  <button
                    onClick={() => setExpandedParents(prev => ({ ...prev, [parent.id]: !prev[parent.id] }))}
                    className="ml-10 text-xs font-bold text-blue-500 hover:text-blue-600"
                  >
                    {isExpanded ? `▲ 답글 ${replies.length}개 숨기기` : `▼ 답글 ${replies.length}개 보기`}
                  </button>
                )}

                {isExpanded && replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} onReply={handleReplyClick} isReply={true} />
                ))}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t bg-white">
          {replyTo && (
            <div className="px-2 py-1 mb-2 text-xs flex justify-between bg-slate-50 rounded">
              <span><b>{replyTo.nickname}</b>님에게 답글 중</span>
              <button onClick={() => setReplyTo(null)}>✕</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input ref={inputRef} className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="댓글 입력..." />
            <button type="submit" className="text-blue-500 font-bold text-sm" disabled={!text.trim()}>게시</button>
          </form>
        </div>
      </div>
    </div>
  );
}