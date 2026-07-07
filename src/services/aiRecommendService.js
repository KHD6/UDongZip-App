// src/services/aiRecommendService.js
import React from "react";
import { Moon, Volume2, Clock, Home, Activity, Coins, Star, Leaf } from "lucide-react";

export const PET_DB = {
  dog_small: { id: "dog_small", name: "소형견 (포메/푸들)", scientificName: "Canis lupus familiaris", vibe: "활기찬 단짝 🐶", desc: "사람을 좋아하며 산책을 즐기는 애교쟁이입니다. 분리불안 예방 교육이 중요합니다.", initialCost: "80만원", lifeSpan: "13년", attributes: ["주행성", "활발", "애교"], needs: [{ name: "하네스/리드줄", price: "25,000원" }, { name: "강아지 전용 방석", price: "40,000원" }] },
  dog_large: { id: "dog_large", name: "대형견 (리트리버)", scientificName: "Canis lupus familiaris", vibe: "듬직한 산책 메이트 🐕", desc: "에너지가 넘치고 활동량이 매우 많습니다. 매일 긴 산책이 필수입니다.", initialCost: "150만원", lifeSpan: "10년", attributes: ["주행성", "활동량 최고", "넓은 공간"], needs: [{ name: "튼튼한 대형 하네스", price: "50,000원" }, { name: "대용량 사료", price: "60,000원" }] },
  cat_persian: { id: "cat_persian", name: "페르시안 고양이", scientificName: "Felis catus", vibe: "우아한 귀족 🐱", desc: "조용하고 온순하며 빗질을 좋아합니다.", initialCost: "100만원", lifeSpan: "18년", attributes: ["정숙함", "긴털", "실내생활"], needs: [{ name: "전문 미용 브러시", price: "30,000원" }, { name: "수직 캣타워", price: "120,000원" }] },
  cat_active: { id: "cat_active", name: "뱅갈 고양이", scientificName: "Felis catus", vibe: "호기심 대장 🐆", desc: "사냥 본능이 강하고 활동적입니다. 놀이 시간이 많아야 합니다.", initialCost: "120만원", lifeSpan: "14년", attributes: ["매우 활동적", "호기심", "수직공간"], needs: [{ name: "대형 캣휠", price: "200,000원" }, { name: "다양한 장난감", price: "40,000원" }] },
  sugarglider: { id: "sugarglider", name: "슈가글라이더", scientificName: "Petaurus breviceps", vibe: "밤새 장난칠 준비된 애교쟁이 🐾", desc: "야행성으로 저녁 퇴근 시간 이후 활발합니다. 무리 생활을 하므로 최소 2마리 이상 합사 권장.", initialCost: "50만원", lifeSpan: "12년", attributes: ["야행성", "사교성", "높은 활동량"], needs: [{ name: "대형 철장", price: "120,000원" }, { name: "쳇바퀴", price: "45,000원" }] },
  hamster: { id: "hamster", name: "골든 햄스터", scientificName: "Mesocricetus auratus", vibe: "볼주머니 대장 🐹", desc: "단독 사육 필수이며 공간 차지가 적어 관리가 쉽습니다.", initialCost: "20만원", lifeSpan: "2년", attributes: ["독립적", "컴팩트", "가성비"], needs: [{ name: "대형 케이지", price: "90,000원" }, { name: "무소음 쳇바퀴", price: "38,000원" }] },
  hedgehog: { id: "hedgehog", name: "고슴도치", scientificName: "Atelerix albiventris", vibe: "수줍은 귀염둥이 🦔", desc: "야행성이고 울음소리가 없어 조용한 환경에 좋습니다. 온도 유지가 필수입니다.", initialCost: "30만원", lifeSpan: "6년", attributes: ["정숙함", "야행성", "온도유지"], needs: [{ name: "대형 리빙박스", price: "60,000원" }, { name: "전용 은신처", price: "15,000원" }] },
  rabbit: { id: "rabbit", name: "토끼", scientificName: "Oryctolagus cuniculus", vibe: "깡충거리는 초식 신사 🐰", desc: "배변 훈련이 가능하며 의외로 지능이 높습니다. 이갈이 본능이 강합니다.", initialCost: "40만원", lifeSpan: "10년", attributes: ["초식", "배변훈련", "활동적"], needs: [{ name: "울타리", price: "45,000원" }, { name: "티모시 건초", price: "25,000원" }] },
  ferret: { id: "ferret", name: "페럿", scientificName: "Mustela putorius furo", vibe: "장난꾸러기 대장 🦦", desc: "엄청난 에너지를 가졌으며 교감을 많이 갈구하는 친구입니다.", initialCost: "90만원", lifeSpan: "8년", attributes: ["사교적", "고에너지", "육식"], needs: [{ name: "대형 케이지", price: "180,000원" }, { name: "고단백 사료", price: "40,000원" }] },
  parrot: { id: "parrot", name: "왕관앵무", scientificName: "Nymphicus hollandicus", vibe: "노래하는 단짝 🦜", desc: "사람을 잘 따르며 지능이 높습니다. 외로움을 타니 주의가 필요합니다.", initialCost: "60만원", lifeSpan: "18년", attributes: ["지능 높음", "사회적", "주행성"], needs: [{ name: "버드 케이지", price: "85,000원" }, { name: "장난감", price: "30,000원" }] },
  beardeddragon: { id: "beardeddragon", name: "비어디 드래곤", scientificName: "Pogona vitticeps", vibe: "온순한 힐링 드래곤 🦎", desc: "사람을 잘 따르고 조용해서 1인 가구에 추천합니다.", initialCost: "45만원", lifeSpan: "11년", attributes: ["정숙함", "낮 활동형", "초보추천"], needs: [{ name: "UVB 램프", price: "50,000원" }, { name: "온습도 장비", price: "30,000원" }] },
  chinchilla: { id: "chinchilla", name: "친칠라", scientificName: "Chinchilla lanigera", vibe: "부드러운 솜뭉치 ☁️", desc: "부드러운 털이 특징입니다. 온도와 습도 조절에 매우 예민합니다.", initialCost: "70만원", lifeSpan: "15년", attributes: ["정숙함", "온도민감", "부드러움"], needs: [{ name: "전용 목욕 모래", price: "15,000원" }, { name: "냉각판", price: "20,000원" }] },
  guineapig: { id: "guineapig", name: "기니피그", scientificName: "Cavia porcellus", vibe: "우렁찬 목소리 🐷", desc: "사회적이며 의사표현이 확실한 초식동물입니다.", initialCost: "10만원", lifeSpan: "7년", attributes: ["사교적", "초식", "관리용이"], needs: [{ name: "대형 케이지", price: "70,000원" }, { name: "급수기", price: "10,000원" }] },
  gecko: { id: "gecko", name: "레오파드게코", scientificName: "Eublepharis macularius", vibe: "작은 미소천사 🦎", desc: "온순하고 다루기 쉽습니다. 관리가 간편해 초보자에게 좋습니다.", initialCost: "15만원", lifeSpan: "10년", attributes: ["정숙함", "컴팩트", "초보추천"], needs: [{ name: "은신처", price: "20,000원" }, { name: "온열매트", price: "15,000원" }] },
  fish: { id: "fish", name: "베타 피쉬", scientificName: "Betta splendens", vibe: "물속의 화려한 예술가 🐟", desc: "작은 공간에서도 잘 살며 화려한 지느러미를 가졌습니다.", initialCost: "5만원", lifeSpan: "3년", attributes: ["정숙함", "공간최소화", "가성비"], needs: [{ name: "어항 세트", price: "30,000원" }, { name: "전용 사료", price: "10,000원" }] },
  chick: { id: "chick", name: "병아리", scientificName: "Gallus gallus", vibe: "쫄랑쫄랑 집사바라기 🐥", desc: "호기심이 매우 강하고 사람을 아주 잘 따릅니다.", initialCost: "2만원", lifeSpan: "8년", attributes: ["활발함", "친화력", "낮 활동형"], needs: [{ name: "보온 전등", price: "20,000원" }, { name: "사료통", price: "5,000원" }] }
};

export const QUESTIONS = [
  { id: "sleep", title: "활동 시간은?", icon: "Moon", options: [{ label: "야행성형", value: "night" }, { label: "아침형", value: "day" }] },
  { id: "noise", title: "소음 민감도?", icon: "Volume2", options: [{ label: "매우 예민", value: "sensitive" }, { label: "둔감함", value: "heavy" }] },
  { id: "time", title: "교감 가능 시간?", icon: "Clock", options: [{ label: "오래 비움", value: "short" }, { label: "틈틈이 케어", value: "long" }] },
  { id: "space", title: "거주 공간 크기?", icon: "Home", options: [{ label: "좁음/원룸", value: "compact" }, { label: "넓음/아파트", value: "spacious" }] },
  { id: "activity", title: "산책/운동 선호도?", icon: "Activity", options: [{ label: "매우 활동적", value: "active" }, { label: "정적/관찰", value: "quiet" }] },
  { id: "cost", title: "초기 비용 투자?", icon: "Coins", options: [{ label: "알뜰형", value: "budget" }, { label: "프리미엄", value: "premium" }] },
  { id: "grooming", title: "털 빠짐 관리?", icon: "Star", options: [{ label: "많아도 됨", value: "many" }, { label: "전혀 안됨", value: "none" }] },
  { id: "diet", title: "식단 관리?", icon: "Leaf", options: [{ label: "채식 위주", value: "herbivore" }, { label: "육식/잡식", value: "omnivore" }] }
];

export const calculateResult = (answers) => {
  const scores = Object.keys(PET_DB).reduce((acc, key) => ({ ...acc, [key]: 0 }), {});
  
  // 가중치 알고리즘: 각 항목 점수 부여
  Object.keys(answers).forEach(qId => {
    const val = answers[qId];
    if (qId === 'sleep' && val === 'night') { scores.sugarglider += 5; scores.hamster += 3; scores.hedgehog += 3; }
    if (qId === 'noise' && val === 'sensitive') { scores.beardeddragon += 5; scores.hedgehog += 4; scores.fish += 4; }
    if (qId === 'time' && val === 'short') { scores.cat_persian += 5; scores.hamster += 4; scores.beardeddragon += 3; }
    if (qId === 'space' && val === 'compact') { scores.hamster += 5; scores.fish += 5; scores.gecko += 4; }
    if (qId === 'activity' && val === 'active') { scores.dog_large += 5; scores.cat_active += 4; scores.ferret += 4; }
    if (qId === 'cost' && val === 'budget') { scores.hamster += 4; scores.fish += 5; scores.guineapig += 3; }
    if (qId === 'grooming' && val === 'none') { scores.beardeddragon += 5; scores.gecko += 5; scores.fish += 5; }
    if (qId === 'diet' && val === 'herbivore') { scores.rabbit += 5; scores.guineapig += 5; }
  });

  const best = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  return PET_DB[best];
};