"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  listenToMessages, sendRealMessage, sendRealImage, sendRealVoice, sendRealDocument,
  setTyping, listenToChatDoc, listenToPresence
} from "@/lib/realChat";
import Avatar from "./Avatar";
import RealCallScreen from "./RealCallScreen";
import RealGroupCallScreen from "./RealGroupCallScreen";
import { sendPushNotification } from "@/lib/push";

function formatLastSeen(lastSeen) {
  if (!lastSeen) return "";
  const ms = lastSeen.toMillis ? lastSeen.toMillis() : lastSeen;
  const diffMin = Math.round((Date.now() - ms) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.round(diffHr / 24)}d ago`;
}

// `chat` is a chats/{id} doc: { id, isGroup, name?, participants, participantInfo }.
// For a 1:1 chat there's no `name` — we derive the other person from participants.
export default function RealChatRoom({ chat, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [outgoingCall, setOutgoingCall] = useState(null); // { callId, type }
  const [groupCallId, setGroupCallId] = useState(null);
  const [outgoingGroupCallType, setOutgoingGroupCallType] = useState("video");
  const [chatDoc, setChatDoc] = useState(chat);
  const [presence, setPresence] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const docRef = useRef(null);
  const typingTimeout = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const recordTimerRef = useRef(null);

  const isGroup = !!chat.isGroup;
  const otherUid = !isGroup ? chat.participants.find((p) => p !== user.uid) : null;
  const otherProfile = !isGroup ? chat.participantInfo?.[otherUid] || { name: "Kabootar user" } : null;
  const headerTitle = isGroup ? chat.name : otherProfile.name;

  // Typing indicator (from anyone but me) takes priority over static subtitle.
  const typingUids = Object.entries(chatDoc?.typing || {}).filter(
    ([uid, ts]) => uid !== user.uid && ts && Date.now() - ts < 6000
  );
  const isTyping = typingUids.length > 0;
  const typingNames = typingUids
    .map(([uid]) => chat.participantInfo?.[uid]?.name)
    .filter(Boolean)
    .join(", ");

  let headerSub;
  if (isTyping) headerSub = isGroup ? `${typingNames} typing…` : "typing…";
  else if (isGroup) headerSub = chatDoc?.lastMessage ? `${chat.participants.length} members` : `${chat.participants.length} members`;
  else if (presence?.online) headerSub = "Online";
  else if (presence?.lastSeen) headerSub = `last seen ${formatLastSeen(presence.lastSeen)}`;
  else headerSub = otherProfile.phoneNumber || otherProfile.email;

  useEffect(() => {
    if (!chat?.id) return;
    const unsub = listenToMessages(chat.id, setMessages);
    return unsub;
  }, [chat?.id]);

  useEffect(() => {
    if (!chat?.id) return;
    const unsub = listenToChatDoc(chat.id, setChatDoc);
    return unsub;
  }, [chat?.id]);

  useEffect(() => {
    if (isGroup || !otherUid) return;
    const unsub = listenToPresence(otherUid, setPresence);
    return unsub;
  }, [isGroup, otherUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear my own typing flag when leaving this chat.
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      setTyping(chat.id, user.uid, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setTyping(chat.id, user.uid, true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(chat.id, user.uid, false), 3000);
  };

  const notifyOthers = (bodyText) => {
    const recipients = chat.participants.filter((p) => p !== user.uid);
    const title = isGroup ? chat.name : user.displayName || "Kabootar";
    recipients.forEach((uid) => sendPushNotification(uid, title, isGroup ? `${user.displayName || "Someone"}: ${bodyText}` : bodyText));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const t = text;
    setText("");
    clearTimeout(typingTimeout.current);
    setTyping(chat.id, user.uid, false);
    try {
      await sendRealMessage(chat.id, user.uid, t);
      notifyOthers(t);
    } catch {
      setText(t); // roll back so the user doesn't lose what they typed
    }
  };

  const handlePickImage = () => fileRef.current?.click();
  const handlePickDoc = () => docRef.current?.click();

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await sendRealImage(chat.id, user.uid, file);
      notifyOthers("📷 Photo");
    } catch {
      alert("Photo bhejne mein problem hui, dobara try karo");
    } finally {
      setUploading(false);
    }
  };

  const handleDocFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await sendRealDocument(chat.id, user.uid, file);
      notifyOthers(`📄 ${file.name}`);
    } catch {
      alert("File bhejne mein problem hui, dobara try karo");
    } finally {
      setUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recordedChunks.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && recordedChunks.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recordTimerRef.current);
        const blob = new Blob(recordedChunks.current, { type: "audio/webm" });
        const sec = recordSec;
        setRecording(false);
        setRecordSec(0);
        if (blob.size > 0) {
          setUploading(true);
          try {
            await sendRealVoice(chat.id, user.uid, blob, sec);
            notifyOthers("🎤 Voice message");
          } catch {
            alert("Voice note bhejne mein problem hui");
          } finally {
            setUploading(false);
          }
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecordSec(0);
      recordTimerRef.current = setInterval(() => setRecordSec((s) => s + 1), 1000);
    } catch {
      alert("Mic access nahi mila");
    }
  };
  const stopRecording = () => mediaRecorderRef.current?.stop();

  const startCall = (type) => {
    if (isGroup) {
      setOutgoingGroupCallType(type);
      setGroupCallId(`${chat.id}_${Date.now()}`);
    } else {
      setOutgoingCall({ callId: `${chat.id}_${Date.now()}`, type });
    }
  };

  return (
    <div className="absolute inset-0 z-[500] bg-app flex flex-col">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageFile} />
      <input type="file" ref={docRef} className="hidden" onChange={handleDocFile} />
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-2 shadow">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl">←</button>
        <Avatar name={headerTitle} size={38} />
        <div className="flex-1 px-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{headerTitle}</div>
          <div className={`text-[11px] leading-tight truncate ${isTyping ? "text-white font-medium" : "text-white/75"}`}>{headerSub}</div>
        </div>
        <button onClick={() => startCall("audio")} className="w-10 h-10 flex items-center justify-center text-lg">📞</button>
        <button onClick={() => startCall("video")} className="w-10 h-10 flex items-center justify-center text-lg">📹</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center text-xs text-app3 mt-10">
            No messages yet — say hi to {headerTitle} 👋
          </div>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.uid;
          const senderName = isGroup ? chat.participantInfo?.[m.senderId]?.name || "Someone" : null;
          return (
            <div key={m.id} className={`max-w-[75%] flex flex-col ${mine ? "self-end items-end" : "self-start items-start"}`}>
              {isGroup && !mine && <div className="text-[11px] font-semibold text-primary px-1 mb-0.5">{senderName}</div>}
              <div className={`rounded-2xl text-sm overflow-hidden ${mine ? "bg-primary text-white rounded-br-sm" : "bg-app2 text-app rounded-bl-sm"} ${m.imageUrl ? "p-1" : "px-3.5 py-2"}`}>
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt="" className="rounded-xl max-w-[220px] max-h-[280px] object-cover" />
                ) : m.audioUrl ? (
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <audio controls src={m.audioUrl} className="w-full h-9" />
                  </div>
                ) : m.documentUrl ? (
                  <a href={m.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 min-w-[180px]">
                    <span className="text-2xl">📄</span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{m.documentName}</div>
                      <div className="text-[11px] opacity-70">{m.documentSize}</div>
                    </div>
                  </a>
                ) : (
                  m.text
                )}
              </div>
            </div>
          );
        })}
        {uploading && (
          <div className="self-end max-w-[75%] px-3.5 py-2 rounded-2xl text-sm bg-primary/60 text-white">Bhej rahe hain…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2 border-t border-app">
        {recording ? (
          <div className="flex-1 flex items-center gap-2.5 bg-red-500/10 rounded-full px-4 py-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-app flex-1">Recording… {String(Math.floor(recordSec / 60)).padStart(1, "0")}:{String(recordSec % 60).padStart(2, "0")}</span>
            <button type="button" onClick={stopRecording} className="text-xs font-semibold text-red-500">Stop & Send</button>
          </div>
        ) : (
          <>
            <button type="button" onClick={handlePickImage} disabled={uploading} className="w-11 h-11 rounded-full bg-app2 text-app flex items-center justify-center text-lg shrink-0 disabled:opacity-40">
              📷
            </button>
            <button type="button" onClick={handlePickDoc} disabled={uploading} className="w-11 h-11 rounded-full bg-app2 text-app flex items-center justify-center text-lg shrink-0 disabled:opacity-40">
              📄
            </button>
            <input
              value={text}
              onChange={handleTextChange}
              placeholder="Message"
              className="flex-1 bg-app2 rounded-full px-4 py-2.5 text-sm outline-none text-app"
            />
            {text.trim() ? (
              <button type="submit" className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-lg">
                ➤
              </button>
            ) : (
              <button type="button" onClick={startRecording} disabled={uploading} className="w-11 h-11 rounded-full bg-app2 text-app flex items-center justify-center text-lg disabled:opacity-40">
                🎤
              </button>
            )}
          </>
        )}
      </form>

      {outgoingCall && !isGroup && (
        <RealCallScreen
          role="caller"
          callId={outgoingCall.callId}
          myUid={user.uid}
          myName={user.displayName || "Kabootar user"}
          otherUser={otherProfile}
          type={outgoingCall.type}
          onEnd={() => setOutgoingCall(null)}
        />
      )}

      {groupCallId && isGroup && (
        <RealGroupCallScreen
          isStarter
          callId={groupCallId}
          myUid={user.uid}
          myName={user.displayName || "Kabootar user"}
          starterInfo={{
            participants: chat.participants,
            participantInfo: chat.participantInfo,
            type: outgoingGroupCallType,
            name: chat.name
          }}
          onEnd={() => setGroupCallId(null)}
        />
      )}
    </div>
  );
}
