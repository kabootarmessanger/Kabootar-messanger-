// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Kabootar Firebase project config (these are public client keys — safe to
// ship in the frontend bundle; access is controlled via Firestore/Storage
// security rules, not by hiding this object).
//
// Reads from NEXT_PUBLIC_FIREBASE_* env vars when set (so you can point a
// staging/production build at a different Firebase project without
// touching code), falling back to this repo's own project so the app still
// runs with zero setup.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBzah8Uk_kw-yNa3830v_OCtF6_KPZNA8E",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kabootar-messanger.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kabootar-messanger",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kabootar-messanger.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "584989256409",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:584989256409:web:15298698cdcac68425ecc8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-NK64DVWTMG"
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
