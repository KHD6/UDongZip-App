// src/components/ai/RecommendResult.jsx
import React from "react";
import { Coins, Heart, Package, CheckCircle2 } from "lucide-react";

export default function RecommendResult({ result, onRestart }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50 text-center">
        {/* ❗ 이미지 영역: object-cover로 꽉 채우고 원형 마스크 적용 */}
        <div className="mx-auto w-32 h-32 mb-4 animate-bounce rounded-full overflow-hidden border-4 border-[#fdfbf7] shadow-lg">
          <img 
            src={`/images/pets/${result.id}.png`} 
            className="w-full h-full object-cover" 
            alt={result.name} 
          />
        </div>
        
        <h3 className="text-2xl font-black text-slate-800 mb-2">{result.name}</h3>
        <p className="text-sm font-bold text-[#c29b7c] mb-6">{result.vibe}</p>
        
        <div className="bg-[#fdfbf7] rounded-[24px] p-4 text-sm font-bold text-slate-600 leading-relaxed max-w-sm mx-auto">
          {result.desc}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-50 flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-xl text-[#c29b7c]"><Coins size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">비용</p>
            <p className="text-sm font-black text-slate-800">{result.initialCost}</p>
          </div>
        </div>
        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-50 flex items-center gap-3">
          <div className="p-2.5 bg-orange-50 rounded-xl text-[#c29b7c]"><Heart size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold">수명</p>
            <p className="text-sm font-black text-slate-800">{result.lifeSpan}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
        <h4 className="font-black text-slate-800 mb-2 flex items-center gap-2 text-sm">
          <CheckCircle2 size={16} className="text-[#c29b7c]" /> 펫 가이드 요약
        </h4>
        <p className="text-xs font-medium text-slate-500 leading-relaxed pl-6">{result.desc}</p>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50">
        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm">
          <Package size={16} className="text-[#c29b7c]" /> 필수 입문 용품 목록
        </h4>
        <div className="space-y-3">
          {result.needs.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#fdfbf7] p-3 rounded-xl border border-orange-50/50">
              <span className="text-xs font-bold text-slate-600 pl-1">{item.name}</span>
              <span className="text-xs font-black text-slate-800">{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onRestart} 
        className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl cursor-pointer hover:bg-slate-900 transition-all active:scale-[0.98]"
      >
        다시 진단하기
      </button>
    </div>
  );
}