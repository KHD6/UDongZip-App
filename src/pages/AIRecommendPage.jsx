// src/pages/AIRecommendPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QUESTIONS, calculateResult } from "../services/aiRecommendService";
import RecommendResult from "../components/ai/RecommendResult"; // 새로 만든 결과 컴포넌트

export default function AIRecommendPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleSelect = (qId, value) => {
    const nextAnswers = { ...answers, [qId]: value };
    setAnswers(nextAnswers);
    if (step < QUESTIONS.length - 1) setStep(prev => prev + 1);
    else setResult(calculateResult(nextAnswers));
  };

  const handlePrev = () => { if (step > 0) setStep(prev => prev - 1); };

  return (
    <div className="w-full max-w-[600px] mx-auto py-6 px-4 min-h-screen flex flex-col">
      <div className="flex items-center gap-3 pb-4 border-b border-orange-100/50 mb-6">
        <button onClick={() => step > 0 ? handlePrev() : navigate("/")} className="p-2 hover:bg-white rounded-full transition-colors cursor-pointer border border-slate-50"><ArrowLeft size={20} /></button>
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2"><Sparkles size={18} className="text-[#c29b7c]" /> AI 맞춤 집사 진단</h2>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[10px] font-black text-[#c29b7c] uppercase">질문 단계</span>
              <span className="text-[10px] font-bold text-slate-400">{step + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="w-full bg-slate-100 p-0.5 rounded-full mb-6"><div className="bg-[#c29b7c] h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-50">
              <h3 className="text-xl font-black text-slate-800 mb-6">{QUESTIONS[step].title}</h3>
              <div className="space-y-3">
                {QUESTIONS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => handleSelect(QUESTIONS[step].id, opt.value)} className="w-full text-left p-5 bg-[#fdfbf7] hover:bg-[#c29b7c] hover:text-white rounded-[20px] transition-all border border-orange-50/50 cursor-pointer flex justify-between active:scale-[0.99]">
                    <span className="text-sm font-bold">{opt.label}</span><ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <RecommendResult result={result} onRestart={() => { setAnswers({}); setStep(0); setResult(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}