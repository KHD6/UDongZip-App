import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Camera, Share2, Settings } from "lucide-react";
import { useViewer } from "../../context/ViewerContext";

export default function ProfileHeader({ 
  userData, userPostsCount, followerCount, followingCount, 
  isMe, isFollowing, toggleFollow, setIsEditModalOpen, 
  setActiveTab 
}) {
  const { openViewer } = useViewer();

  const calculateAge = (birthday) => {
    if (!birthday) return "";
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (age === 0) return ` · ${monthDiff > 0 ? monthDiff : 0}개월`;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age === 0 ? ` · ${monthDiff}개월` : ` · ${age}살`;
  };

  const totalPetItems = (userData.pets?.length || 0) + (isMe ? 1 : 0);
  const showScrollHint = totalPetItems > 3;

  return (
    <header className="w-full">
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4 px-1">
          <h2 className="font-extrabold text-slate-800 text-lg">우리 아이들</h2>
          {showScrollHint && <span className="text-[10px] text-slate-400 font-medium animate-pulse">옆으로 넘겨보세요</span>}
        </div>
        <Swiper slidesPerView="auto" spaceBetween={12} className="w-full">
          {userData.pets?.map((pet, index) => (
            <SwiperSlide key={index} className="!w-[140px]">
              <div 
                className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-sm group cursor-pointer border border-white"
                onClick={() => openViewer(userData.pets.map(p => ({ type: "image", url: p.photoURL, name: p.name })), index)}
              >
                <img src={pet.photoURL} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={pet.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="font-black text-sm truncate">{pet.name}</p>
                  <p className="text-[10px] font-bold opacity-90 truncate">{pet.species || ""}{calculateAge(pet.birthday)}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
          {isMe && (
            <SwiperSlide className="!w-[140px]">
              <div onClick={() => setIsEditModalOpen(true)} className="aspect-[3/4] rounded-[24px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-300 hover:border-[#c29b7c] hover:text-[#c29b7c] transition-all cursor-pointer bg-white/50">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">+</div>
                <span className="text-xs font-black">아이 등록</span>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img src={userData.photoURL || "/default-profile.png"} className="w-20 h-20 rounded-full object-cover border-4 border-[#fdfbf7] shadow-md cursor-pointer" alt="profile"
              onClick={() => openViewer([{ type: "image", url: userData.photoURL || "/default-profile.png" }], 0)} />
            {isMe && (
              <div onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50"><Camera size={12} className="text-slate-600" /></div>
            )}
          </div>
          <div className="flex-1 flex justify-around py-1">
            {[ { id: "feed", label: "게시글", value: userPostsCount }, { id: "팔로워", label: "팔로워", value: followerCount }, { id: "팔로잉", label: "팔로잉", value: followingCount } ].map((stat, idx) => (
              <React.Fragment key={stat.id}>
                <div className="flex flex-col items-center cursor-pointer group" onClick={() => setActiveTab(stat.id)}>
                  <span className="font-black text-slate-800 text-lg group-hover:text-[#c29b7c] transition-colors">{stat.value}</span>
                  <span className="text-[11px] text-slate-400 font-bold">{stat.label}</span>
                </div>
                {idx < 2 && <div className="w-[1px] h-8 bg-slate-100 self-center" />}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="mb-6 px-1">
          <h1 className="font-black text-xl text-slate-800 tracking-tight">{userData.displayName || "집사"}</h1>
          <p className="text-sm text-slate-500 leading-relaxed font-bold">{userData.bio || "반가워요! 우동집 집사입니다. 🐾"}</p>
        </div>
        <div className="flex gap-2">
          {isMe ? (
            <button onClick={() => setIsEditModalOpen(true)} className="flex-1 py-3 bg-[#c29b7c] text-white text-sm font-black rounded-2xl cursor-pointer hover:bg-[#b08968] transition-all">프로필 편집</button>
          ) : (
            <button onClick={toggleFollow} className={`flex-1 py-3 text-sm font-black rounded-2xl cursor-pointer transition-all ${isFollowing ? "bg-slate-100 text-slate-500" : "bg-[#c29b7c] text-white"}`}>{isFollowing ? "언팔로우" : "팔로우"}</button>
          )}
          <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl cursor-pointer hover:bg-slate-100"><Share2 size={20} /></button>
        </div>
      </div>
    </header>
  );
}