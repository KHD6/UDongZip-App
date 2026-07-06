import React from "react";
import { useParams, useNavigate } from "react-router-dom";

function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <button 
        onClick={() => navigate(-1)} 
        className="mb-4 text-sm text-slate-500 hover:text-slate-800"
      >
        ← 뒤로가기
      </button>
      <h2 className="text-xl font-bold text-slate-800">게시글 상세보기</h2>
      <p className="mt-2 text-sm text-slate-500">선택한 게시글 ID: {postId}</p>
      <p className="mt-4 text-slate-600">여기에는 상세 내용과 댓글 창이 렌더링될 예정입니다. 🐾</p>
    </div>
  );
}

export default PostDetailPage;