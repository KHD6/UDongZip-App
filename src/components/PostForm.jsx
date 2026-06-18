import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function PostForm({ onSubmit, onClose }) {
  const [content, setContent] = useState('');
  
  // 파일, 임시 주소, 타입을 객체로 묶어서 배열로 관리합니다.
  const [mediaItems, setMediaItems] = useState([]); 
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 글도 없고 미디어도 없으면 전송 방지
    if (!content.trim() && mediaItems.length === 0) return;

    /* =========================================================================
       [★ 가장 중요한 배달 사고 해결 포인트 ★]
       App.jsx의 handleCreatePost가 ({ content, mediaList }) 형태로 구조 분해 할당을 하므로,
       여기서 보낼 때 반드시 정확히 'mediaList'라는 이름으로 매칭해서 던져야 합니다!
       ========================================================================= */
    onSubmit({
      content: content,
      mediaList: mediaItems.map(item => ({
        url: item.preview,
        type: item.type
      }))
    });
    
    // 상태 초기화 및 닫기
    setContent('');
    setMediaItems([]);
    onClose();
  };

  // 파일 추가 선택 시 작동
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 새로 선택된 파일들을 순회하며 가상 URL 및 타입 추출
    const newItems = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    // 기존에 선택해둔 미디어 뒤에 이어 붙이기 (다중 등록 허용)
    setMediaItems([...mediaItems, ...newItems]);
  };

  // 선택된 미디어 개별 삭제 기능
  const removeMedia = (index) => {
    const updated = [...mediaItems];
    // 브라우저 메모리 관리를 위해 가상 URL 해제
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    setMediaItems(updated);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return ReactDOM.createPortal(
    <div 
      onClick={onClose} 
      className="fixed inset-0 bg-slate-950/70 z-[999] flex justify-end flex-col animate-fadeIn cursor-pointer"
    >
      <form 
        onClick={(e) => e.stopPropagation()} 
        onSubmit={handleSubmit}
        className="w-full h-[100dvh] bg-white rounded-t-3xl shadow-xl flex flex-col animate-slideInUp 
                   md:h-auto md:max-w-2xl md:mx-auto md:rounded-2xl md:mb-10 cursor-default"
      >
        
        {/* 모달 상단 헤더 */}
        <div className="p-4 flex justify-between items-center border-b border-slate-100 shrink-0">
          <button type="button" onClick={onClose} className="p-1 text-slate-500 hover:text-slate-700 transition cursor-pointer">
            <span>❌</span>
          </button>
          
          <h2 className="hidden md:block font-bold text-slate-800">새 게시글 작성</h2>
          
          <button 
            type="submit" 
            disabled={!content.trim() && mediaItems.length === 0}
            className={`px-5 py-2 rounded-full font-bold text-sm shadow-sm transition tracking-tight
              ${content.trim() || mediaItems.length > 0 
                ? 'bg-udong-orange hover:bg-udong-orange-hover text-white cursor-pointer' 
                : 'bg-orange-200 text-orange-100 cursor-not-allowed'
              }`}
          >
            게시하기
          </button>
        </div>

        {/* 모달 본문 입력창 */}
        <div className="flex-1 p-4 flex flex-col overflow-y-auto pt-6 gap-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0 flex items-center justify-center text-xs text-slate-500 font-bold">
              나
            </div>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="동물 친구들의 오늘 소식을 들려주세요!" 
              rows="3" 
              className="w-full resize-none border-none outline-none text-slate-800 placeholder-slate-400 text-sm focus:ring-0 pt-1" 
              autoFocus 
            />
          </div>

          {/* 🎬 글쓰기 창 내부 가로 스크롤 미리보기 리스트 */}
          {mediaItems.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {mediaItems.map((item, idx) => (
                <div key={idx} className="relative min-w-[180px] h-[135px] bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => removeMedia(idx)} 
                    className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-[10px] font-bold transition cursor-pointer"
                  >
                    ✕
                  </button>
                  {item.type === 'image' ? (
                    <img src={item.preview} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <video src={item.preview} className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 미디어 파일 추가 바 */}
        <div className="flex p-4 gap-2 text-lg shrink-0 pb-10 md:pb-4 border-t border-slate-50 select-none">
          <span 
            onClick={() => fileInputRef.current.click()} 
            className="hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer flex items-center justify-center"
          >
            🖼️
          </span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*, video/*" 
            multiple // 여러 개 파일 다중 선택 기능 오픈
            className="hidden" 
          />
        </div>
        
      </form>
    </div>,
    document.getElementById('modal-root')
  );
}

export default PostForm;