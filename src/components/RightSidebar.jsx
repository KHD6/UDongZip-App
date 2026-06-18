import React from 'react';

function RightSidebar() {
  return (
    <aside className="hidden lg:block w-72 bg-udong-purple text-white p-6 sticky top-0 h-screen shadow-lg">
      <h3 className="font-bold text-lg mb-4 tracking-tight border-b border-purple-300 pb-2">
        추후 콘텐츠 영역
      </h3>
      <div className="space-y-3 text-sm font-medium">
        <div className="bg-udong-purple-bg p-4 rounded-xl border border-purple-300/30">
          🏥 카페/병원 지도 서비스
        </div>
        <div className="bg-udong-purple-bg p-4 rounded-xl border border-purple-300/30">
          📰 예원동물 최신 뉴스
        </div>
        <div className="bg-udong-purple-bg p-4 rounded-xl border border-purple-300/30">
          🏞️ 추천 산책 공원 / 소모임
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;