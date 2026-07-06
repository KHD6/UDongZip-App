// src/components/profile/ProfileBody.jsx
import React from "react";
import PostCard from "../PostCard";
import UserList from "./UserList";

export default function ProfileBody({ 
  activeTab, setActiveTab, userPosts, allMediaList, 
  followerUsers, followingUsers, myFollowingIds, 
  toggleFollow, authUid, setViewer, volume 
}) {
  const tabs = [
    { id: "feed", label: "게시글" },
    { id: "media", label: "미디어" },
    { id: "팔로워", label: "팔로워" },
    { id: "팔로잉", label: "팔로잉" }
  ];

  return (
    <div className="w-full">
      {/* 탭 버튼 스타일링 (캡슐 형태) */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-black rounded-[14px] cursor-pointer transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full min-h-[400px]">
        {activeTab === "feed" && (
          <div className="space-y-6">
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  {...post} 
                  volume={volume} 
                  onOpenViewer={(idx, onClose) => setViewer({ 
                    isOpen: true, 
                    list: (post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), 
                    index: idx, 
                    postId: post.id, 
                    onClose 
                  })} 
                />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-slate-300 text-3xl mb-4">🐾</p>
                <p className="text-slate-400 text-sm font-bold">아직 작성한 게시글이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="w-full">
            {allMediaList.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {allMediaList.map((media, mIdx) => (
                  <div 
                    key={mIdx} 
                    className="aspect-square bg-slate-200 rounded-[16px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-white shadow-sm" 
                    onClick={() => setViewer({ isOpen: true, list: allMediaList, index: mIdx })}
                  >
                    {media.type === "video" ? (
                      <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={media.url} className="w-full h-full object-cover" alt="media" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 text-sm font-bold">아직 공유된 미디어가 없습니다. 🐾</div>
            )}
          </div>
        )}

        {(activeTab === "팔로워" || activeTab === "팔로잉") && (
          <div className="bg-white rounded-[28px] p-2 border border-slate-100 shadow-sm">
            <UserList 
              users={activeTab === "팔로워" ? followerUsers : followingUsers} 
              type={activeTab} 
              myFollowingIds={myFollowingIds} 
              toggleFollow={toggleFollow} 
              authUid={authUid} 
            />
          </div>
        )}
      </div>
    </div>
  );
}