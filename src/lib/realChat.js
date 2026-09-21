import { db, storage } from "./firebase";
import {
  doc, setDoc, getDoc, collection, query, where, getDocs,
  addDoc, onSnapshot, orderBy, serverTimestamp, limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Turns whatever format a phone number was typed/read in (spaces, dashes,
// brackets, a leading 0, no country code…) into one consistent E.164-ish
// string so two different entries of "the same" number always match exactly
// in Firestore. This MUST be used everywhere a phone number is written or
// queried, or lookups will silently fail on formatting differences.
export function normalizePhone(raw, defaultCountryCode = "+91") {
  if (!raw) return "";
  let digits = String(raw).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  digits = digits.replace(/^0+/, "");
  return `${defaultCountryCode}${digits}`;
}

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
  const phone = normalizePhone(extra.phoneNumber || user.phoneNumber || "");
  if (phone) data.phoneNumber = phone;
  await setDoc(ref, data, { merge: true });
}

// Look up a registered user by their phone number (any format — it's
// normalized before querying).
export async function findUserByPhone(phoneNumber) {
  const q = query(collection(db, "users"), where("phoneNumber", "==", normalizePhone(phoneNumber)), limit(1));
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

// Given a list of raw phone numbers (e.g. straight from the device's
// contact book), find which of them belong to registered Kabootar users.
// Firestore's "in" operator caps at 30 values per query, so this chunks.
export async function findUsersByPhones(rawNumbers) {
  const normalized = [...new Set(rawNumbers.map((n) => normalizePhone(n)).filter(Boolean))];
  const results = [];
  for (let i = 0; i < normalized.length; i += 30) {
    const chunk = normalized.slice(i, i + 30);
    const q = query(collection(db, "users"), where("phoneNumber", "in", chunk));
    const snap = await getDocs(q);
    snap.forEach((d) => results.push(d.data()));
  }
  return results;
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

// Create a group chat (3+ people). `members` is an array of the OTHER
// participants' user docs (as returned by findUserByPhone/etc — each with
// uid/name/phoneNumber/email); the creator (me) is added automatically.
export async function createGroupChat(name, members, me) {
  const participantInfo = {
    [me.uid]: { name: me.name || "Kabootar user", phoneNumber: me.phoneNumber || "", email: me.email || "" }
  };
  members.forEach((m) => {
    participantInfo[m.uid] = { name: m.name || "Kabootar user", phoneNumber: m.phoneNumber || "", email: m.email || "" };
  });
  const ref = await addDoc(collection(db, "chats"), {
    isGroup: true,
    name: name.trim(),
    participants: [me.uid, ...members.map((m) => m.uid)],
    participantInfo,
    createdBy: me.uid,
    createdAt: serverTimestamp(),
    lastMessage: "",
    lastMessageAt: serverTimestamp()
  });
  return {
    id: ref.id,
    isGroup: true,
    name: name.trim(),
    participants: [me.uid, ...members.map((m) => m.uid)],
    participantInfo
  };
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

// Uploads an image to Firebase Storage and posts it as a message in the chat.
export async function sendRealImage(chatId, senderUid, file) {
  const path = `chats/${chatId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: senderUid,
    imageUrl: url,
    createdAt: serverTimestamp()
  });
  await setDoc(
    doc(db, "chats", chatId),
    { lastMessage: "📷 Photo", lastMessageAt: serverTimestamp() },
    { merge: true }
  );
}
