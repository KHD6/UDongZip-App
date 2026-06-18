import React from 'react';

// props에 onOpenModal(모달 열기 함수)를 받아옵니다.
function Sidebar({ onOpenModal }) {
  return (
    <aside className="w-full md:w-64 bg-udong-rose text-white p-4 
                      fixed bottom-0 left-0 z-[500] 
                      md:sticky md:top-0 md:h-screen md:flex md:flex-col md:justify-between">
      <div>
        <div className="hidden md:flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-udong-rose font-bold">
            🐿️
          </div>
          <span className="font-bold text-xl tracking-wide">우동집</span>
        </div>

        <nav className="flex md:flex-col justify-around md:justify-start gap-2">
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-udong-rose-hover transition font-medium w-full text-left">
            <span>📱</span> <span className="hidden md:inline">피드</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-udong-rose-hover transition font-medium w-full text-left">
            <span>📍</span> <span className="hidden md:inline">지도</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500 transition font-medium w-full text-left">
            <span>💬</span> <span className="hidden md:inline">채팅</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500 transition font-medium w-full text-left">
            <span>👤</span> <span className="hidden md:inline">마이</span>
          </button>
        </nav>
      </div>

      <div className="hidden md:block mt-6 space-y-4">
        {/* PC 글쓰기 버튼에도 모달 열기 함수 연결! */}
        <button 
          onClick={onOpenModal} 
          className="w-full bg-udong-orange hover:bg-udong-orange-hover text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
        >
          글쓰기
        </button>
        <div className="bg-udong-blue text-white p-4 rounded-xl text-center text-sm font-semibold h-32 flex items-center justify-center shadow-inner">
          추후 광고 영역
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;