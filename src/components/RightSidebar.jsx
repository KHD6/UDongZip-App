import React from 'react';

function RightSidebar() {
  return (
    <aside className="hidden lg:block w-72 p-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="font-bold text-slate-700 mb-4">Trending</h2>
        <div className="space-y-4 text-sm text-slate-500">
          <p>#파스텔감성</p>
          <p>#웹개발기록</p>
          <p>#시맨틱마크업</p>
        </div>
      </div>
    </aside>
  );
}
export default RightSidebar;