import { db } from "./firebase";
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  addDoc, onSnapshot, orderBy, serverTimestamp, limit
} from "firebase/firestore";

// Call this right after signup/login so other users can find this account.
// `extra.phoneNumber` / `extra.name` let us attach a phone number and name
// even for auth methods (like email-link) where Firebase itself doesn't
// capture a phone number on the user object.
export async function ensureUserDoc(user, extra = {}) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const data = {
    uid: user.uid,
    email: (user.email || "").toLowerCase(),
    name:
      extra.name ||
      user.displayName ||
      user.phoneNumber ||
      (user.email ? user.email.split("@")[0] : "Kabootar user"),
    updatedAt: serverTimestamp()
  };
  // Only touch phoneNumber when we actually have a value, so a later login
  // that doesn't re-supply it never blanks out what's already saved.
  const phone = extra.phoneNumber || user.phoneNumber;
  if (phone) data.phoneNumber = phone;
  await setDoc(ref, data, { merge: true });
}

// Look up a registered user by their phone number (E.164, e.g. +919876543210).
export async function findUserByPhone(phoneNumber) {
  const q = query(collection(db, "users"), where("phoneNumber", "==", phoneNumber.trim()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

// Look up a registered user by their exact email address (for accounts
// created via Google sign-in that may not have a phone number on file).
export async function findUserByEmail(email) {
  const q = query(collection(db, "users"), where("email", "==", email.trim().toLowerCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
}

// Accepts either a phone number or an email and searches the right field.
export async function findUserByIdentifier(value) {
  const v = value.trim();
  if (v.includes("@")) return findUserByEmail(v);
  return findUserByPhone(v);
}

// Fetch a user's own Firestore profile doc (name/phone/email as saved).
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}
export function chatIdFor(uidA, uidB) {
  return [uidA, uidB].sort().join("_");
}

// Create the chat document if it doesn't exist yet, and return its id.
export async function getOrCreateChat(me, other) {
  const chatId = chatIdFor(me.uid, other.uid);
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [me.uid, other.uid],
      participantInfo: {
        [me.uid]: { name: me.name, phoneNumber: me.phoneNumber || "", email: me.email || "" },
        [other.uid]: { name: other.name, phoneNumber: other.phoneNumber || "", email: other.email || "" }
      },
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastMessageAt: serverTimestamp()
    });
  }
  return chatId;
}

// List every real chat the given uid is part of (one-time fetch — pair with
// a snapshot listener in the component for live updates).
export function listenToMyChats(uid, callback) {
  const q = query(collection(db, "chats"), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Real-time message stream for one chat, oldest first.
export function listenToMessages(chatId, callback) {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendRealMessage(chatId, senderUid, text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: senderUid,
    text: trimmed,
    createdAt: serverTimestamp()
  });
  await setDoc(
    doc(db, "chats", chatId),
    { lastMessage: trimmed, lastMessageAt: serverTimestamp() },
    { merge: true }
  );
}
