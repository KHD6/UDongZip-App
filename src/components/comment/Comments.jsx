// src/components/comment/Comments.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom"; // Portal용 임포트
import { addDoc, collection, serverTimestamp, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db, auth } from "../../firebase";
import CommentItem from "./CommentItem";
import { X } from "lucide-react"; // 일관성 있는 X 아이콘 사용

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

  useEffect(() => {
    // 뒷배경 스크롤 잠금 (Portal 마운트 시 동작)
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const targetParentId = replyTo ? replyTo.parentId || replyTo.id : null;
      await addDoc(collection(db, "comments"), {
        postId, text, parentId: targetParentId,
        uid: auth.currentUser.uid,
        nickname: auth.currentUser.displayName || "익명의 집사",
        photoURL: auth.currentUser.photoURL || null,
        createdAt: serverTimestamp(),
      });
      setText(""); setReplyTo(null);
    } catch (error) { console.error("댓글 작성 실패:", error); }
  };

  const handleReplyClick = (comment) => {
    const targetParent = comment.parentId ? comments.find((c) => c.id === comment.parentId) : comment;
    setReplyTo(targetParent);
    setText(`@${comment.nickname} `);
    inputRef.current?.focus();
  };

  const parentComments = comments.filter((c) => !c.parentId);

  // ReactDOM.createPortal을 사용해 document.body에 직접 바인딩하여 찌그러짐 원천 방어
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-end sm:items-center justify-center backdrop-blur-sm">
      <div className="bg-[#fdfbf7] w-full h-[90vh] sm:h-[80vh] sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] flex flex-col overflow-hidden shadow-2xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-200">
        
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-orange-100 bg-white/50">
          <h3 className="font-black text-slate-800 tracking-tight text-base">댓글</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 댓글 목록 리스트 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {parentComments.map((parent) => {
            const replies = comments.filter((r) => r.parentId === parent.id);
            const isExpanded = expandedParents[parent.id];
            return (
              <div key={parent.id} className="space-y-4">
                <CommentItem comment={parent} onReply={handleReplyClick} isReply={false} />
                {replies.length > 0 && (
                  <button 
                    onClick={() => setExpandedParents(prev => ({ ...prev, [parent.id]: !prev[parent.id] }))} 
                    className="ml-10 text-xs font-black text-[#c29b7c] hover:text-[#b08968] transition-colors cursor-pointer"
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

        {/* 하단 입력 폼 */}
        <div className="p-4 border-t border-orange-100 bg-white">
          {replyTo && (
            <div className="px-3 py-1.5 mb-2 text-xs flex justify-between bg-orange-50/50 text-slate-600 rounded-xl border border-orange-100/50">
              <span><b>{replyTo.nickname}</b>님에게 답글 중</span>
              <button onClick={() => setReplyTo(null)} className="text-slate-400 font-bold cursor-pointer">✕</button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input 
              ref={inputRef} 
              className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-[#c29b7c] focus:bg-white transition-all text-slate-700" 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="댓글 입력..." 
            />
            <button 
              type="submit" 
              className="text-[#c29b7c] hover:text-[#b08968] font-black text-sm px-4 transition-colors cursor-pointer" 
              disabled={!text.trim()}
            >
              게시
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}