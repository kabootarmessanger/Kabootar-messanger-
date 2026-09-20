"use client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listenToMessages, sendRealMessage } from "@/lib/realChat";
import Avatar from "./Avatar";

export default function RealChatRoom({ chatId, otherUser, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    const unsub = listenToMessages(chatId, setMessages);
    return unsub;
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const t = text;
    setText("");
    try {
      await sendRealMessage(chatId, user.uid, t);
    } catch {
      setText(t); // roll back so the user doesn't lose what they typed
    }
  };

  return (
    <div className="absolute inset-0 z-[500] bg-app flex flex-col">
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-2 shadow">
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl">←</button>
        <Avatar name={otherUser.name} size={38} />
        <div className="flex-1 px-1">
          <div className="font-semibold text-sm leading-tight">{otherUser.name}</div>
          <div className="text-[11px] text-white/75 leading-tight">{otherUser.phoneNumber || otherUser.email}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-center text-xs text-app3 mt-10">
            No messages yet — say hi to {otherUser.name} 👋
          </div>
        )}
        {messages.map((m) => {
          const mine = m.senderId === user.uid;
          return (
            <div key={m.id} className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${mine ? "self-end bg-primary text-white rounded-br-sm" : "self-start bg-app2 text-app rounded-bl-sm"}`}>
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="p-2.5 flex items-center gap-2 border-t border-app">
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
    </div>
  );
}
