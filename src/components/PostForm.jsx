import React, { useState } from "react";
import { storage, auth } from "../firebase"; // auth를 import합니다.
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function PostForm({ onSubmit, onClose }) {
  const [content, setContent] = useState("");
  const [mediaList, setMediaList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
    }));
    setMediaList([...mediaList, ...newMedia]);
  };

  const removeMedia = (index) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 로그인 체크
    if (!auth.currentUser) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }
    
    if (!content.trim() && mediaList.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedMediaList = await Promise.all(
        mediaList.map(async (item) => {
          if (!item.file) return item;

          const fileName = `${crypto.randomUUID()}_${item.file.name}`;
          const storageRef = ref(storage, `posts/${fileName}`);

          await uploadBytes(storageRef, item.file);
          const url = await getDownloadURL(storageRef);

          return { 
            url, 
            type: item.type, 
            path: storageRef.fullPath 
          };
        })
      );

      // 데이터 저장 시 uid를 확실히 포함해서 넘깁니다.
      await onSubmit({ 
        content, 
        mediaList: uploadedMediaList,
        uid: auth.currentUser.uid,
        createdAt: new Date()
      });
      
      onClose();
    } catch (error) {
      console.error("업로드 실패:", error);
      alert("데이터 저장 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-700">새 기록 작성</h2>
          <button onClick={onClose} className="text-slate-400">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none resize-none"
            placeholder="오늘의 소중한 순간을 기록해보세요 :)"
          />

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {mediaList.map((m, idx) => (
              <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-200">
                {m.type === 'video' ? (
                  <video src={m.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={m.url} className="w-full h-full object-cover" alt="" />
                )}
                <button type="button" onClick={() => removeMedia(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 text-xs">✕</button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="cursor-pointer bg-slate-100 p-3 rounded-xl">
              <span>🖼️</span>
              <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </label>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition"
            >
              {isUploading ? "업로드 중..." : "기록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;