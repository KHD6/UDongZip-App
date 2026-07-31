// src/pages/MapPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, MapPin, Store, HeartPulse, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, query, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import L from "leaflet";

// Leaflet 기본 마커 아이콘 설정
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 지도 크기 강제 재확인 컴포넌트 (회색 박스 방어)
function MapResizeComponent() {
  const map = useMapEvents({});
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function MapPage() {
  const navigate = useNavigate();
  const [pins, setPins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPinCoord, setNewPinCoord] = useState(null);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("hospital");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "mapPins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPins(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleMapClick = (latlng) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      alert("로그인 후 장소를 등록할 수 있습니다. 🐾");
      return;
    }
    setNewPinCoord(latlng);
    setTitle("");
    setDescription("");
    setIsModalOpen(true);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (!title.trim() || !newPinCoord) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mapPins"), {
        title: title.trim(),
        category,
        description: description.trim(),
        lat: newPinCoord.lat,
        lng: newPinCoord.lng,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewPinCoord(null);
    } catch (error) {
      console.error("핀 등록 실패:", error);
      alert("장소 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat) => {
    switch(cat) {
      case 'hospital': return <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1"><HeartPulse size={12}/> 동물병원</span>;
      case 'cafe': return <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1"><Store size={12}/> 펫카페/용품</span>;
      case 'meetup': return <span className="bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1"><Users size={12}/> 모임장소</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full h-screen bg-[#fdfbf7] flex flex-col relative overflow-hidden">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-orange-100/50 bg-white/80 backdrop-blur-md z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-white rounded-full transition-colors cursor-pointer border border-slate-50 shadow-sm">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h2 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <MapPin size={18} className="text-[#c29b7c]" /> 동네 지도 및 교류
          </h2>
        </div>
        <div className="text-xs font-bold text-slate-400 hidden sm:block">
          💡 원하는 위치를 지도에서 클릭하면 핀을 꽂을 수 있어요!
        </div>
      </div>

      {/* 지도 컨테이너 (고정 뷰포트 높이 확보) */}
      <div className="flex-1 w-full relative" style={{ height: "calc(100vh - 73px)" }}>
        <MapContainer 
          center={[37.5665, 126.9780]} 
          zoom={14} 
          style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        >
          <MapResizeComponent />
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.lat, pin.lng]}>
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[160px]">
                  {getCategoryBadge(pin.category)}
                  <p className="font-black text-sm text-slate-800">{pin.title}</p>
                  {pin.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">{pin.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 새 장소 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-slate-800 text-base">📍 이 장소 공유하기</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full cursor-pointer transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 ml-1">장소 분류</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hospital', label: '동물병원', icon: HeartPulse },
                    { id: 'cafe', label: '펫카페/용품', icon: Store },
                    { id: 'meetup', label: '모임장소', icon: Users },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-2.5 px-2 rounded-2xl text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all border ${
                        category === cat.id 
                          ? "bg-[#c29b7c] text-white border-[#c29b7c] shadow-md shadow-orange-900/10" 
                          : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                      }`}
                    >
                      <cat.icon size={16} />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 ml-1">장소 이름</label>
                <input 
                  type="text"
                  required
                  placeholder="예: 멍냥 다정 동물병원"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#c29b7c] transition-all text-slate-700"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 ml-1">상세 정보 및 추천 이유</label>
                <textarea 
                  rows={3}
                  placeholder="예: 의사선생님 엄청 친절하시고 과잉진료 없어요!"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 text-sm font-medium outline-none focus:border-[#c29b7c] transition-all text-slate-700 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-sm rounded-2xl cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 bg-[#c29b7c] hover:bg-[#b08968] text-white font-black text-sm rounded-2xl cursor-pointer transition-all shadow-md shadow-orange-900/10 disabled:opacity-50"
                >
                  {isSubmitting ? "등록 중..." : "핀 꽂기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}