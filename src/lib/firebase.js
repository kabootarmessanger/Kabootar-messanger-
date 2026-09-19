// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// यहाँ अपना कॉपी किया हुआ firebaseConfig पेस्ट करें
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase को इनिशियलाइज़ करें
const app = initializeApp(firebaseConfig);

// सर्विसेज को एक्सपोर्ट करें ताकि आप इन्हें कहीं भी यूज़ कर सकें
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
import { auth } from '../firebase'; // अपना पाथ चेक कर लें
import { signInWithEmailAndPassword } from "firebase/auth";

const handleLogin = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful!");
  } catch (error) {
    console.error("Error logging in: ", error.message);
  }
};
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore"; 

const sendMessage = async (chatId, messageText, senderId) => {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: messageText,
      sender: senderId,
      createdAt: new Date()
    });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
