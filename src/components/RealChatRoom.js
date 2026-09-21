"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listenToMessages, sendRealMessage, sendRealImage } from "@/lib/realChat";
import Avatar from "./Avatar";
import RealCallScreen from "./RealCallScreen";

// `chat` is a chats/{id} doc: { id, isGroup, name?, participants, participantInfo }.
// For a 1:1 chat there's no `name` — we derive the other person from participants.
export default function RealChatRoom({ chat, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [outgoingCall, setOutgoingCall] = useState(null); // { callId, type }
  const bottomRef = useRef(null);
  const fileRef = useRef(null);

  const isGroup = !!chat.isGroup;
  const otherUid = !isGroup ? chat.participants.find((p) => p !== user.uid) : null;
  const otherProfile = !isGroup ? chat.participantInfo?.[otherUid] || { name: "Kabootar user" } : null;
  const headerTitle = isGroup ? chat.name : otherProfile.name;
  const headerSub = isGroup
    ? `${chat.participants.length} members`
    : otherProfile.phoneNumber || otherProfile.email;

  useEffect(() => {
    if (!chat?.id) return;
    const unsub = listenToMessages(chat.id, setMessages);
    return unsub;
  }, [chat?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const t = text;
    setText("");
    try {
      await sendRealMessage(chat.id, user.uid, t);
    } catch {
      setText(t); // roll back so the user doesn't lose what they typed
    }
  };

  const handlePickImage = () => fileRef.current?.click();

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await sendRealImage(chat.id, user.uid, file);
    } catch {
      alert("Photo bhejne mein problem hui, dobara try karo");
    } finally {
      setUploading(false);
    }
  };

  const startCall = (type) => {
    setOutgoingCall({ callId: `${chat.id}_${Date.now()}`, type });
  };

  return (
    <div className="absolute inset-0 z-[500] bg-app flex flex-col">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleImageFile} />
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-2 shadow">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl">←</button>
        <Avatar name={headerTitle} size={38} />
        <div className="flex-1 px-1 min-w-0">
          <div className="font-semibold text-sm leading-tight truncate">{headerTitle}</div>
          <div className="text-[11px] text-white/75 leading-tight truncate">{headerSub}</div>
        </div>
        {!isGroup && (
          <>
            <button onClick={() => startCall("audio")} className="w-10 h-10 flex items-center justify-center text-lg">📞</button>
            <button onClick={() => startCall("video")} className="w-10 h-10 flex items-center justify-center text-lg">📹</button>
          </>
        )}
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
                ) : (
                  m.text
                )}
              </div>
            </div>
          );
        })}
        {uploading && (
          <div className="self-end max-w-[75%] px-3.5 py-2 rounded-2xl text-sm bg-primary/60 text-white">Photo bhej rahe hain…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2 border-t border-app">
        <button type="button" onClick={handlePickImage} disabled={uploading} className="w-11 h-11 rounded-full bg-app2 text-app flex items-center justify-center text-lg shrink-0 disabled:opacity-40">
          📷
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message"
          className="flex-1 bg-app2 rounded-full px-4 py-2.5 text-sm outline-none text-app"
        />
        <button type="submit" disabled={!text.trim()} className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center text-lg disabled:opacity-40">
          ➤
        </button>
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
    </div>
  );
}
