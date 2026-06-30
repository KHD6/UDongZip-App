import React, { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import RelativeTime from "./RelativeTime";
import ActionMenu from "./ActionMenu";

export default function CommentItem({ comment, onReply, isReply = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  
  // 현재 접속 유저가 댓글 작성자인지 확인
  const isOwner = auth.currentUser?.uid === comment.uid;

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, "comments", comment.id));
      } catch (error) {
        console.error("댓글 삭제 실패:", error);
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(db, "comments", comment.id), { text: editText });
      setIsEditing(false);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
    }
  };

  return (
    <div className={`flex gap-3 ${isReply ? "ml-10 mt-2" : "mt-4"}`}>
      {/* 프로필 이미지 */}
      <img 
        src={comment.photoURL || "/default-profile.png"} 
        className="w-8 h-8 rounded-full object-cover" 
        alt="profile" 
      />
      
      <div className="flex flex-col flex-1 items-start">
        {/* 헤더 영역: 이름, 시간, ... 메뉴 */}
        <div className="flex w-full justify-between items-start">
          <div className="flex items-center gap-2 h-7">
            <span className="font-bold text-sm text-slate-800">{comment.nickname}</span>
            <span className="text-xs text-slate-400">
              <RelativeTime createdAt={comment.createdAt} />
            </span>
          </div>

          {/* 모든 댓글에 노출되는 ActionMenu */}
          {!isEditing && (
            <ActionMenu 
              onEdit={isOwner ? () => setIsEditing(true) : null} 
              onDelete={isOwner ? handleDelete : null} 
              onReport={() => alert("신고되었습니다. (업데이트 예정)")} 
            />
          )}
        </div>

        {/* 댓글 내용 또는 수정 입력창 */}
        {isEditing ? (
          <div className="w-full mt-1">
            <textarea 
              className="w-full bg-slate-50 border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" 
              value={editText} 
              onChange={(e) => setEditText(e.target.value)} 
            />
            <div className="flex gap-2 mt-1">
              <button onClick={handleUpdate} className="text-xs text-blue-600 font-bold">저장</button>
              <button onClick={() => setIsEditing(false)} className="text-xs text-slate-400">취소</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700">{comment.text}</p>
        )}

        {/* 답글 달기 버튼 (답글에는 표시 안 함) */}
        {!isEditing && !isReply && (
          <button 
            onClick={() => onReply(comment)} 
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 mt-1"
          >
            답글 달기
          </button>
        )}
      </div>
    </div>
  );
}