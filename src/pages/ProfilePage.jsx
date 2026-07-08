// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import EditProfileModal from "../components/profile/EditProfileModal";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBody from "../components/profile/ProfileBody";

export default function ProfilePage({ volume, setVolume }) {
  const { uid } = useParams();
  const { fetchProfile } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [myFollowingIds, setMyFollowingIds] = useState(new Set());
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      const data = userDoc.exists() ? userDoc.data() : {};
      setUserData(data);

      const postsSnapshot = await getDocs(query(collection(db, "posts"), where("uid", "==", uid), orderBy("createdAt", "desc")));
      setUserPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const followerSnap = await getDocs(query(collection(db, "follows"), where("followingId", "==", uid)));
      setFollowerCount(followerSnap.size);
      const fers = await Promise.all(followerSnap.docs.map(async fDoc => {
        const uSnap = await getDoc(doc(db, "users", fDoc.data().followerId));
        return uSnap.exists() ? { uid: uSnap.id, ...uSnap.data() } : null;
      }));
      setFollowerUsers(fers.filter(u => u !== null));

      const followingSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", uid)));
      setFollowingCount(followingSnap.size);
      const fings = await Promise.all(followingSnap.docs.map(async fDoc => {
        const uSnap = await getDoc(doc(db, "users", fDoc.data().followingId));
        return uSnap.exists() ? { uid: uSnap.id, ...uSnap.data() } : null;
      }));
      setFollowingUsers(fings.filter(u => u !== null));

      if (auth.currentUser) {
        const myFollowSnap = await getDocs(query(collection(db, "follows"), where("followerId", "==", auth.currentUser.uid)));
        const myFollows = new Set(myFollowSnap.docs.map(d => d.data().followingId));
        setMyFollowingIds(myFollows);
        setIsFollowing(myFollows.has(uid));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [uid]);

  const toggleFollow = async (targetUid) => {
    if (!auth.currentUser || auth.currentUser.uid === targetUid) return;
    try {
      const isCurrentlyFollowing = myFollowingIds.has(targetUid);
      if (isCurrentlyFollowing) {
        const q = query(collection(db, "follows"), where("followerId", "==", auth.currentUser.uid), where("followingId", "==", targetUid));
        const snap = await getDocs(q);
        snap.forEach(d => deleteDoc(doc(db, "follows", d.id)));
        setMyFollowingIds(prev => { const next = new Set(prev); next.delete(targetUid); return next; });
        if (targetUid === uid) { setIsFollowing(false); setFollowerCount(prev => prev - 1); }
      } else {
        await addDoc(collection(db, "follows"), { followerId: auth.currentUser.uid, followingId: targetUid, createdAt: new Date() });
        setMyFollowingIds(prev => new Set(prev).add(targetUid));
        if (targetUid === uid) { setIsFollowing(true); setFollowerCount(prev => prev + 1); }
      }
    } catch (err) { console.error(err); }
  };

  const allMediaList = userPosts.flatMap(post => (post.mediaList || []).map(m => ({ ...m, type: m.type || "image", postId: post.id })));

  if (loading) return <div className="p-8 text-center text-slate-400">🐾 집사 정보를 불러오는 중...</div>;

  return (
    <div className="w-full min-h-screen bg-[#fdfbf7] mx-auto py-6 px-4 md:px-6">
      <ProfileHeader 
        userData={userData} userPostsCount={userPosts.length}
        followerCount={followerCount} followingCount={followingCount}
        isMe={auth.currentUser?.uid === uid} isFollowing={isFollowing}
        toggleFollow={() => toggleFollow(uid)} setIsEditModalOpen={setIsEditModalOpen}
        setActiveTab={setActiveTab}
      />
      <ProfileBody 
        activeTab={activeTab} setActiveTab={setActiveTab}
        userPosts={userPosts} allMediaList={allMediaList}
        followerUsers={followerUsers} followingUsers={followingUsers}
        myFollowingIds={myFollowingIds} toggleFollow={toggleFollow}
        authUid={auth.currentUser?.uid} volume={volume}
      />
      {isEditModalOpen && (
        <EditProfileModal userData={userData} uid={uid} onClose={() => setIsEditModalOpen(false)} onUpdate={async () => { await fetchData(); await fetchProfile(uid); }} />
      )}
    </div>
  );
}