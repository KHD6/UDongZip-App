import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ProfileHeader({ 
  userData, 
  userPostsCount, 
  followerCount, 
  followingCount, 
  isMe, 
  isFollowing, 
  toggleFollow, 
  setIsEditModalOpen, 
  setActiveTab, 
  setViewer 
}) {
  return (
    <header className="w-full">
      {/* 펫 갤러리 */}
      <div className="mb-6">
        <Swiper slidesPerView="auto" spaceBetween={16} className="w-full">
          {userData.pets?.map((pet, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <div
                className="flex flex-col items-center gap-2 group cursor-pointer"
                onClick={() => setViewer({
                  isOpen: true,
                  list: userData.pets.map(p => ({ type: "image", url: p.photoURL, name: p.name })),
                  index: index
                })}
              >
                <div className="relative w-20 h-20 rounded-full border-2 border-slate-100 overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
                  <img src={pet.photoURL} className="w-full h-full object-cover" alt={pet.name} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-bold truncate px-1">{pet.name}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          {(!userData.pets || userData.pets.length === 0) && isMe && (
            <SwiperSlide className="!w-auto">
              <div
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => setIsEditModalOpen(true)}
              >
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs hover:border-slate-400 hover:text-slate-400 transition-colors">
                  +
                </div>
                <span className="text-[11px] font-bold text-slate-400">등록</span>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      {/* 프로필 정보 바 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <img
            src={userData.photoURL || "/default-profile.png"}
            className="w-20 h-20 rounded-full object-cover shadow-sm border border-slate-100 cursor-pointer"
            alt="프로필"
            onClick={() => setViewer({
              isOpen: true,
              list: [{ type: "image", url: userData.photoURL || "/default-profile.png" }],
              index: 0
            })}
          />
          <div className="flex gap-6 md:gap-10">
            {[
              { id: "feed", label: "게시글", value: userPostsCount },
              { id: "팔로워", label: "팔로워", value: followerCount },
              { id: "팔로잉", label: "팔로잉", value: followingCount },
            ].map((stat) => (
              <div 
                key={stat.id} 
                className="flex flex-col items-center cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" 
                onClick={() => setActiveTab(stat.id)}
              >
                <span className="font-bold text-slate-800">{stat.value}</span>
                <span className="text-[11px] text-slate-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        {isMe ? (
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
          >
            프로필 편집
          </button>
        ) : (
          <button 
            onClick={toggleFollow} 
            className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
              isFollowing ? "bg-slate-200 text-slate-800" : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </button>
        )}
      </div>

      <div className="mb-6">
        <h1 className="font-bold text-lg text-slate-800">{userData.displayName || "집사"}</h1>
        <p className="text-sm text-slate-600 mt-1">{userData.bio || "반가워요! 우동집 집사입니다. 🐾"}</p>
      </div>
    </header>
  );
}