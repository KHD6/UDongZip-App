// src/components/profile/UserList.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function UserList({ users, type, myFollowingIds, toggleFollow, authUid }) {
  return (
    <div className="flex flex-col gap-1 w-full p-2">
      {users.length > 0 ? (
        users.map((user) => {
          const isMe = authUid === user.uid;
          const followedByMe = myFollowingIds.has(user.uid);

          return (
            <div 
              key={user.uid} 
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-[20px] transition-colors"
            >
              <Link 
                to={`/profile/${user.uid}`} 
                className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1 group"
              >
                <img
                  src={user.photoURL || "/default-profile.png"}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0 group-hover:opacity-90 transition-opacity"
                  alt={user.displayName}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-black text-sm text-slate-800 truncate group-hover:text-[#c29b7c] transition-colors">
                    {user.displayName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold truncate">
                    @{user.user_handle || user.uid.slice(0, 8)}
                  </span>
                </div>
              </Link>

              {!isMe && (
                <button
                  onClick={() => toggleFollow(user.uid)}
                  className={`ml-4 px-5 py-2 rounded-full text-[11px] font-black transition-all cursor-pointer shadow-sm ${
                    followedByMe
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      : "bg-[#c29b7c] text-white hover:bg-[#b08968]"
                  }`}
                >
                  {followedByMe ? "언팔로우" : "팔로우"}
                </button>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-24 text-center">
          <p className="text-slate-300 text-3xl mb-4">🐾</p>
          <p className="text-slate-400 text-sm font-bold tracking-tight">
            아직 {type} 중인 집사가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}