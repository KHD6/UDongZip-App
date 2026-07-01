import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function PostDetailPage() {
  const {组件, postId} = useParams(); // URL에서 :postId 값을 추출
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 상단 뒤로가기 바 */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-xl font-bold text-slate-800">게시글 상세보기</h2>
      </div>

      {/* 게시글 컨텐츠 내용이 들어올 자리 (추후 구현) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-xs text-slate-400 mb-2">Post ID: {postId}</p>
        <p className="text-slate-600">여기에는 선택한 {postId}번 게시글의 상세 내용과 댓글 창이 렌더링될 예정입니다. 🐾</p>
      </div>
    </div>
  );
}

export default PostDetailPage;