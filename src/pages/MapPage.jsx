// src/pages/MapPage.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { collection, addDoc, query, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import L from "leaflet";

// 하위 컴포넌트 임포트
import MapHeader from "../components/map/MapHeader";
import MapHotPlaces from "../components/map/MapHotPlaces";
import PinCreateModal from "../components/map/PinCreateModal";

// 지도 내부 조작을 위한 핸들러
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

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
  const [pins, setPins] = useState([]);
  const [filteredPins, setFilteredPins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [mapCenter, setMapCenter] = useState([37.5665, 126.9780]); // 기본 서울 중심
  const [zoom, setZoom] = useState(14);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPinCoord, setNewPinCoord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Firestore 실시간 핀 구독 및 만료된 핀 필터링
  useEffect(() => {
    const q = query(collection(db, "mapPins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const allPins = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiresAt: data.expiresAt ? data.expiresAt.toDate() : null
        };
      });

      // 만료되지 않은 핀만 필터하여 렌더링
      const activePins = allPins.filter(pin => !pin.expiresAt || pin.expiresAt > now);
      setPins(activePins);
    });
    return () => unsubscribe();
  }, []);

  // 검색어 및 카테고리에 따른 필터링 적용
  useEffect(() => {
    let result = pins;

    if (activeCategory !== "all") {
      result = result.filter(pin => pin.category === activeCategory);
    }

    if (searchQuery.trim()) {
      result = result.filter(pin => 
        pin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pin.description && pin.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPins(result);
  }, [pins, searchQuery, activeCategory]);

  // 브라우저 GPS로 내 위치 찾기
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS를 지원하지 않는 브라우저입니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setZoom(15);
      },
      (error) => {
        console.error(error);
        alert("위치 정보를 가져오지 못했습니다.");
      }
    );
  };

  const handleMapClick = (latlng) => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      alert("로그인 후 장소를 공유할 수 있습니다. 🐾");
      return;
    }
    setNewPinCoord(latlng);
    setIsCreateModalOpen(true);
  };

  const handleSavePin = async (formData) => {
    if (!newPinCoord) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "mapPins"), {
        ...formData,
        lat: newPinCoord.lat,
        lng: newPinCoord.lng,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setIsCreateModalOpen(false);
      setNewPinCoord(null);
    } catch (error) {
      console.error(error);
      alert("등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#fdfbf7] flex flex-col relative overflow-hidden">
      {/* 1단계: 검색 및 필터 헤더 */}
      <MapHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onMyLocationClick={handleMyLocation}
      />

      {/* 지도 영역 */}
      <div className="flex-1 w-full relative" style={{ height: "calc(100vh - 138px)" }}>
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        >
          <MapController center={mapCenter} zoom={zoom} />
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onMapClick={handleMapClick} />

          {filteredPins.map((pin) => (
            <Marker key={pin.id} position={[pin.lat, pin.lng]}>
              <Popup>
                <div className="p-1 space-y-1">
                  <p className="font-black text-sm text-slate-800">{pin.title}</p>
                  {pin.description && <p className="text-xs text-slate-500 leading-tight">{pin.description}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 1단계: 핫플레이스 위젯 */}
        <MapHotPlaces 
          hotPlaces={pins} 
          onPlaceClick={(place) => {
            setMapCenter([place.lat, place.lng]);
            setZoom(15);
          }} 
        />
      </div>

      {isCreateModalOpen && (
        <PinCreateModal 
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSavePin}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}