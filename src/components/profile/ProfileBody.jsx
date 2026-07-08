// src/components/profile/ProfileBody.jsx
import React from "react";
import PostCard from "../post/PostCard";
import UserList from "./UserList";
import { useViewer } from "../../context/ViewerContext";

export default function ProfileBody({ activeTab, setActiveTab, userPosts, allMediaList, followerUsers, followingUsers, myFollowingIds, toggleFollow, authUid, volume }) {
  const { openViewer } = useViewer();
  const tabs = [{ id: "feed", label: "게시글" }, { id: "media", label: "미디어" }, { id: "팔로워", label: "팔로워" }, { id: "팔로잉", label: "팔로잉" }];

  return (
    <div className="w-full">
      <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] mb-8">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2.5 text-xs font-black rounded-[14px] cursor-pointer transition-all ${activeTab === tab.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-400"}`}>
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
                  key={post.id} {...post} volume={volume} 
                  onOpenViewer={(idx, onClose) => openViewer((post.mediaList || []).map(m => ({...m, type: m.type || 'image'})), idx, onClose)} 
                  onUpdateIndex={() => {}} // 빈 함수로 에러 방어
                />
              ))
            ) : (
              <div className="py-24 text-center text-slate-400 text-sm font-bold">아직 작성한 게시글이 없습니다. 🐾</div>
            )}
          </div>
        )}
        {activeTab === "media" && (
          <div className="grid grid-cols-3 gap-1">
            {allMediaList.map((media, mIdx) => (
              <div key={mIdx} className="aspect-square bg-slate-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-white" onClick={() => openViewer(allMediaList, mIdx)}>
                {media.type === "video" ? <video src={media.url} className="w-full h-full object-cover" /> : <img src={media.url} className="w-full h-full object-cover" alt="media" />}
              </div>
            ))}
          </div>
        )}
        {(activeTab === "팔로워" || activeTab === "팔로잉") && (
          <div className="bg-white rounded-[28px] p-2 border border-slate-50 shadow-sm">
            <UserList users={activeTab === "팔로워" ? followerUsers : followingUsers} type={activeTab} myFollowingIds={myFollowingIds} toggleFollow={toggleFollow} authUid={authUid} />
          </div>
        )}
      </div>
    </div>
  );
}