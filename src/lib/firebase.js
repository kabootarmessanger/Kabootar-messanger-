// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Kabootar Firebase project config (these are public client keys — safe to
// ship in the frontend bundle; access is controlled via Firestore/Storage
// security rules, not by hiding this object).
//
// Read entirely from NEXT_PUBLIC_FIREBASE_* env vars (see .env.example) so
// every deploy points at its own Firebase project explicitly — no bundled
// fallback project, so a fork can never accidentally write into someone
// else's database.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fails loudly at build/boot time instead of Firebase throwing a cryptic
  // "invalid-api-key" error deep inside a component later.
  throw new Error(
    "Firebase config missing: copy .env.example to .env.local and fill in " +
    "your own Firebase project's NEXT_PUBLIC_FIREBASE_* values."
  );
}

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
