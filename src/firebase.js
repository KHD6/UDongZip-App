import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCZ3v-mtjL0fFckFXEPeXLU7pMqdju0YvQ", 
  authDomain: "udongzip-app.firebaseapp.com",
  projectId: "udongzip-app",
  storageBucket: "udongzip-app.firebasestorage.app",
  messagingSenderId: "872042142957",
  appId: "1:872042142957:web:0f7d912e75ecf38ac200e4",
  measurementId: "G-JDDMLJ2V28"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);