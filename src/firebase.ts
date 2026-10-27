import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";


// 🔥 FIREBASE CONFIG
const firebaseConfig = {

  apiKey:
    "AIzaSyCfreH_zkywD21O5oIaMGnhQFdyc8DtZvs",

  authDomain:
    "clip-crew-341f0.firebaseapp.com",

  projectId:
    "clip-crew-341f0",

  storageBucket:
    "clip-crew-341f0.firebasestorage.app",

  messagingSenderId:
    "1051478123121",

  appId:
    "1:1051478123121:web:13f2430cb292a9bbecf1d0",
};


// 🔥 INITIALIZE APP
const app =
  initializeApp(
    firebaseConfig
  );


// 🔥 AUTH
export const auth =
  getAuth(app);
  
export const googleProvider =
  new GoogleAuthProvider();

// 🔥 FIRESTORE DATABASE
export const db =
  getFirestore(app);


// 🔥 STORAGE
export const storage =
  getStorage(app);


// 🔥 EXPORT APP
export default app;