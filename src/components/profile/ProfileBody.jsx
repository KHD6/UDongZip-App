import React from "react";
import PostCard from "../PostCard";
import UserList from "./UserList";

export default function ProfileBody({ 
  activeTab, 
  setActiveTab, 
  userPosts, 
  allMediaList, 
  followerUsers, 
  followingUsers, 
  myFollowingIds, 
  toggleFollow, 
  authUid, 
  setViewer, 
  volume 
}) {
  const tabs = [
    { id: "feed", label: "게시글" },
    { id: "media", label: "미디어" },
    { id: "팔로워", label: "팔로워" },
    { id: "팔로잉", label: "팔로잉" }
  ];

  return (
    <div className="w-full">
      {/* 탭 버튼 */}
      <div className="flex border-b border-slate-100 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-bold cursor-pointer transition-all ${
              activeTab === tab.id
                ? "text-slate-900 border-b-2 border-slate-900"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 렌더링 */}
      <div className="w-full">
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
              <div className="py-20 text-center text-slate-400 text-sm">아직 작성한 게시글이 없습니다. 🐾</div>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="w-full">
            {allMediaList.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {allMediaList.map((media, mIdx) => (
                  <div 
                    key={mIdx} 
                    className="aspect-square bg-slate-100 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" 
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
              <div className="py-20 text-center text-slate-400 text-sm">아직 작성한 미디어가 없습니다. 🐾</div>
            )}
          </div>
        )}

        {activeTab === "팔로워" && (
          <UserList 
            users={followerUsers} 
            type="팔로워" 
            myFollowingIds={myFollowingIds} 
            toggleFollow={toggleFollow} 
            authUid={authUid} 
          />
        )}

        {activeTab === "팔로잉" && (
          <UserList 
            users={followingUsers} 
            type="팔로잉" 
            myFollowingIds={myFollowingIds} 
            toggleFollow={toggleFollow} 
            authUid={authUid} 
          />
        )}
      </div>
    </div>
  );
}