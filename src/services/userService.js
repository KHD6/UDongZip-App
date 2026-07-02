import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

/**
 * 고유 닉네임(Handle) 중복 여부를 확인합니다.
 * @param {string} handle - 검사할 고유 닉네임 (예: bori_mom)
 * @param {string} currentUid - 현재 로그인한 유저의 UID (본인 제외용)
 * @returns {Promise<boolean>} - 중복이면 true, 사용 가능하면 false
 */
export const checkHandleDuplication = async (handle, currentUid) => {
  // 영문 소문자, 숫자, 언더바(_), 마침표(.)만 허용하는 정규식 검증
  const handleRegex = /^[a-z0-9_.]+$/;
  if (!handleRegex.test(handle)) {
    throw new Error("고유 닉네임은 영문 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있습니다.");
  }

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("user_handle", "==", handle));
  const querySnapshot = await getDocs(q);

  // 검색 결과가 존재하고, 그 결과가 현재 로그인한 본인이 아니라면 중복임
  let isDuplicate = false;
  querySnapshot.forEach((doc) => {
    if (doc.id !== currentUid) {
      isDuplicate = true;
    }
  });

  return isDuplicate;
};