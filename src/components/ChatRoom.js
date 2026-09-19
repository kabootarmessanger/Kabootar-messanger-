"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageContextMenu from "./MessageContextMenu";
import EmojiPicker from "./EmojiPicker";
import AttachSheet from "./AttachSheet";
import VoiceRecorder from "./VoiceRecorder";
import { SMART_REPLIES } from "@/data/seed";

export default function ChatRoom({ chatName, onClose, onOpenInfo }) {
  const {
    chats,
    contacts,
    getMessages,
    sendMessage,
    deleteMessage,
    editMessage,
    toggleStar,
    togglePinMessage,
    reactToMessage,
    votePoll,
    markRead,
    showToast
  } = useApp();

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [ctxIdx, setCtxIdx] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  const chat = chats.find((c) => c.name === chatName);
  const contact = contacts.find((c) => c.name === chatName);
  const messages = getMessages(chatName);

  useEffect(() => {
    markRead(chatName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatName]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const handleSend = () => {
    if (editingIdx !== null) {
      editMessage(chatName, editingIdx, text.trim());
      setEditingIdx(null);
      setText("");
      return;
    }
    const t = text.trim();
    if (!t) {
      setRecOpen(true);
      return;
    }
    const msg = { text: t };
    if (replyTo) {
      msg.replyTo = { who: replyTo.own ? "You" : chatName, text: replyTo.text || "Media" };
    }
    sendMessage(chatName, msg);
    setText("");
    setReplyTo(null);
  };

  const handleVoiceSend = (sec, url) => {
    sendMessage(chatName, { text: "", voice: true, voiceDuration: sec, audioUrl: url });
    setRecOpen(false);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    sendMessage(chatName, { text: "", image: url });
    setAttachOpen(false);
    e.target.value = "";
  };

  const handleAttachPick = (key) => {
    if (key === "gallery" || key === "camera") {
      fileRef.current?.click();
    } else if (key === "location") {
      setAttachOpen(false);
      if (!navigator.geolocation) return showToast("Location not available");
      navigator.geolocation.getCurrentPosition(
        (p) => sendMessage(chatName, { text: "", location: { lat: p.coords.latitude, lng: p.coords.longitude } }),
        () => sendMessage(chatName, { text: "", location: { lat: 19.076, lng: 72.8777 } })
      );
    } else if (key === "poll") {
      setAttachOpen(false);
      const q = window.prompt("Poll question:");
      if (!q) return;
      const raw = window.prompt("Options (comma separated):", "Option A, Option B");
      const opts = (raw || "").split(",").map((s) => s.trim()).filter(Boolean);
      if (opts.length < 2) return;
      sendMessage(chatName, { text: "", poll: { question: q, options: opts.map((t) => ({ t, v: 0 })) } });
    } else if (key === "sticker") {
      sendMessage(chatName, { text: "😀", sticker: "😀" });
      setAttachOpen(false);
    } else {
      setAttachOpen(false);
    }
  };

  const onLongPress = (idx) => setCtxIdx(idx);

  const handleCtxAction = (action) => {
    const idx = ctxIdx;
    setCtxIdx(null);
    if (idx === null) return;
    const msg = messages[idx];
    if (!msg) return;
    if (action === "reply") setReplyTo(msg);
    if (action === "copy") navigator.clipboard?.writeText(msg.text || "Media").then(() => showToast("Copied"));
    if (action === "star") toggleStar(chatName, idx);
    if (action === "pin") togglePinMessage(chatName, idx);
    if (action === "edit") {
      if (!msg.own || msg.voice || msg.image || msg.poll) return showToast("Can't edit this message");
      setEditingIdx(idx);
      setText(msg.text);
    }
    if (action === "delete") deleteMessage(chatName, idx);
  };

  const handleReact = (emoji) => {
    if (ctxIdx !== null) reactToMessage(chatName, ctxIdx, emoji);
    setCtxIdx(null);
  };

  if (!chat) return null;

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-chat flex flex-col z-[200]">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={handleFile} />

      <div className="bg-primary text-white px-2 py-1.5 flex items-center gap-1 shadow">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl">
          ←
        </button>
        <div className="mr-2">
          <Avatar src={contact?.avatar || chat.avatar} name={chatName} size={40} />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenInfo}>
          <div className="text-base font-medium truncate">{chatName}</div>
          <div className="text-xs text-white/85">{chat.online ? "online" : "last seen recently"}</div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-lg">📹</button>
        <button className="w-10 h-10 flex items-center justify-center text-lg">📞</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        <div className="bg-amber-100/90 text-slate-600 text-xs px-3 py-1.5 rounded-lg text-center mx-auto max-w-[90%] mb-2 self-center">
          🔒 Messages are end-to-end encrypted
        </div>
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            msg={m}
            chatName={chatName}
            index={i}
            onLongPress={onLongPress}
            onVote={(idx, oi) => votePoll(chatName, idx, oi)}
          />
        ))}
      </div>

      {replyTo && (
        <div className="bg-app px-3 py-2 border-l-4 border-primary flex items-center gap-2.5 border-t border-app">
          <div className="flex-1 min-w-0">
            <strong className="text-primary text-xs block mb-0.5">
              Replying to {replyTo.own ? "yourself" : chatName}
            </strong>
            <div className="text-sm text-app2 truncate">{replyTo.text || "Media"}</div>
          </div>
          <span className="text-xl p-1.5 text-app2 cursor-pointer" onClick={() => setReplyTo(null)}>
            ✕
          </span>
        </div>
      )}

      <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-app border-t border-app">
        {SMART_REPLIES.map((r) => (
          <div
            key={r}
            onClick={() => sendMessage(chatName, { text: r })}
            className="px-4 py-2 bg-app2 rounded-full text-[13.5px] font-medium whitespace-nowrap cursor-pointer border border-app"
          >
            {r}
          </div>
        ))}
      </div>

      <div className="bg-app px-2 py-1.5 flex items-end gap-1.5">
        <button onClick={() => setAttachOpen(true)} className="w-11 h-11 flex items-center justify-center text-xl text-app2">
          📎
        </button>
        <div className="flex-1 bg-app2 rounded-3xl px-3.5 py-2.5 flex items-center gap-2 min-h-11">
          <button onClick={() => setEmojiOpen((v) => !v)} className="text-xl opacity-60">
            😊
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setEmojiOpen(false)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message"
            className="flex-1 bg-transparent outline-none text-app text-base min-w-0"
          />
        </div>
        <button
          onClick={handleSend}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-xl ${
            text.trim() || editingIdx !== null ? "bg-primary text-white" : "text-app2"
          }`}
        >
          {editingIdx !== null ? "✓" : text.trim() ? "➤" : "🎤"}
        </button>
      </div>

      <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onPick={(e) => setText((t) => t + e)} />
      <AttachSheet open={attachOpen} onClose={() => setAttachOpen(false)} onPick={handleAttachPick} />
      <VoiceRecorder open={recOpen} onCancel={() => setRecOpen(false)} onSend={handleVoiceSend} />
      <MessageContextMenu
        open={ctxIdx !== null}
        onClose={() => setCtxIdx(null)}
        onAction={handleCtxAction}
        onReact={handleReact}
      />
    </div>
  );
}
