import React from "react";
import { Link } from "react-router-dom";

export default function UserList({ users, type, myFollowingIds, toggleFollow, authUid }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {users.length > 0 ? (
        users.map((user) => {
          const isMe = authUid === user.uid;
          const followedByMe = myFollowingIds.has(user.uid);

          return (
            <div 
              key={user.uid} 
              className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors"
            >
              <Link 
                to={`/profile/${user.uid}`} 
                className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1"
              >
                <img
                  src={user.photoURL || "/default-profile.png"}
                  className="w-10 h-10 rounded-full object-cover border border-slate-100 flex-shrink-0"
                  alt={user.displayName}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-slate-800 truncate">
                    {user.displayName}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    @{user.user_handle || user.uid.slice(0, 8)}
                  </span>
                </div>
              </Link>

              {!isMe && (
                <button
                  onClick={() => toggleFollow(user.uid)}
                  className={`ml-4 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    followedByMe
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {followedByMe ? "언팔로우" : "팔로우"}
                </button>
              )}
            </div>
          );
        })
      ) : (
        <div className="py-20 text-center text-slate-400 text-sm">
          아직 {type} 중인 집사가 없습니다. 🐾
        </div>
      )}
    </div>
  );
}