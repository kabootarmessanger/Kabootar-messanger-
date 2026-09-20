// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Kabootar Firebase project config (these are public client keys — safe to
// ship in the frontend bundle; access is controlled via Firestore/Storage
// security rules, not by hiding this object).
const firebaseConfig = {
  apiKey: "AIzaSyBzah8Uk_kw-yNa3830v_OCtF6_KPZNA8E",
  authDomain: "kabootar-messanger.firebaseapp.com",
  projectId: "kabootar-messanger",
  storageBucket: "kabootar-messanger.firebasestorage.app",
  messagingSenderId: "584989256409",
  appId: "1:584989256409:web:15298698cdcac68425ecc8",
  measurementId: "G-NK64DVWTMG"
};

// Avoid re-initializing on hot reload / multiple imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics needs a real browser (window, indexedDB) — it will crash during
// Next.js server-side rendering, so only load it on the client.
export let analytics = null;
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
    isSupported().then((ok) => {
      if (ok) analytics = getAnalytics(app);
    });
  });
}
