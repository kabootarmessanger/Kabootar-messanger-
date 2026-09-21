import { db } from "./firebase";
import {
  doc, setDoc, updateDoc, onSnapshot, collection, addDoc,
  query, where, serverTimestamp
} from "firebase/firestore";

// Google's public STUN servers — enough to discover a device's public
// address on most home/mobile networks. There's no TURN (relay) server
// configured, so a call between two devices behind strict/symmetric NATs
// (common on some corporate or carrier networks) may fail to connect —
// that's a network limitation, not a bug, and fixing it needs a paid TURN
// relay service.
export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

export async function createCallDoc(callId, data) {
  await setDoc(doc(db, "calls", callId), { ...data, status: "ringing", createdAt: serverTimestamp() });
}

export async function updateCallDoc(callId, data) {
  await updateDoc(doc(db, "calls", callId), data);
}

export function listenToCall(callId, cb) {
  return onSnapshot(doc(db, "calls", callId), (snap) => cb(snap.exists() ? { id: snap.id, ...snap.data() } : null));
}

// Global "is someone calling me right now" listener — mounted once at the
// app shell level so an incoming call can be seen no matter which tab or
// screen the person is currently on.
export function listenForIncomingCalls(myUid, cb) {
  const q = query(collection(db, "calls"), where("calleeId", "==", myUid), where("status", "==", "ringing"));
  return onSnapshot(q, (snap) => {
    const calls = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(calls[0] || null);
  });
}

export function addIceCandidate(callId, subcollection, candidate) {
  return addDoc(collection(db, "calls", callId, subcollection), candidate.toJSON());
}

export function listenToCandidates(callId, subcollection, cb) {
  return onSnapshot(collection(db, "calls", callId, subcollection), (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === "added") cb(change.doc.data());
    });
  });
}

export async function endCall(callId) {
  try {
    await updateCallDoc(callId, { status: "ended" });
  } catch {
    // best-effort — the other side's own connection-state listener will
    // also notice the peer connection dropped and hang up locally.
  }
}
