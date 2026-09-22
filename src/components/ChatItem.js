"use client";
import { useState } from "react";
import Avatar from "./Avatar";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";

export default function ChatItem({ chat, onOpen }) {
  const { chatPins, privateChats, setChatMeta, deleteChat, showToast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const tick = chat.status === "read" ? "✓✓" : chat.status === "delivered" ? "✓✓" : "";
  const isLocked = !!chatPins[chat.name];
  const isPrivate = !!privateChats[chat.name];

  let pressTimer;
  const startPress = () => { pressTimer = setTimeout(() => setMenuOpen(true), 450); };
  const cancelPress = () => clearTimeout(pressTimer);

  return (
    <>
      <div
        onClick={() => onOpen(chat.name)}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        className="flex items-center pl-4 pr-3 py-2.5 cursor-pointer active:bg-app2"
      >
        <div className="mr-3.5 shrink-0">
          <Avatar src={chat.avatar} name={chat.name} size={56} online={chat.online} />
        </div>
        <div className="flex-1 min-w-0 border-b border-app pb-2.5 pt-0.5">
          <div className="flex justify-between items-center mb-1">
            <div className="text-base font-medium text-app truncate flex items-center gap-1.5">
              {chat.name}
              {isLocked && <span className="text-xs">🔒</span>}
              {chat.pinned && <span className="text-xs text-app3">📌</span>}
              {chat.muted && <span className="text-xs text-app3">🔕</span>}
            </div>
            <div className={`text-xs shrink-0 ml-2 ${chat.unread > 0 ? "text-primary font-semibold" : "text-app3"}`}>
              {chat.time}
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div className="text-sm text-app2 truncate flex items-center gap-1">
              {tick && <span className={tick && chat.status === "read" ? "text-blue" : "text-app3"}>{tick}</span>}
              <span className="truncate">{chat.last}</span>
              {isPrivate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold ml-1 shrink-0">
                  🔥
                </span>
              )}
            </div>
            {chat.unread > 0 && (
              <div className="bg-green text-white text-[11px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center px-1.5 shrink-0">
                {chat.unread}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title={chat.name}>
        <div className="flex flex-col">
          <button
            onClick={() => { setChatMeta(chat.name, { pinned: !chat.pinned }); setMenuOpen(false); }}
            className="text-left py-3 px-1 text-sm text-app border-b border-app"
          >
            📌 {chat.pinned ? "Unpin" : "Pin"} chat
          </button>
          <button
            onClick={() => { setChatMeta(chat.name, { muted: !chat.muted }); setMenuOpen(false); }}
            className="text-left py-3 px-1 text-sm text-app border-b border-app"
          >
            🔕 {chat.muted ? "Unmute" : "Mute"} notifications
          </button>
          <button
            onClick={() => {
              setChatMeta(chat.name, { archived: !chat.archived });
              showToast(chat.archived ? "Unarchived" : "Archived");
              setMenuOpen(false);
            }}
            className="text-left py-3 px-1 text-sm text-app border-b border-app"
          >
            📦 {chat.archived ? "Unarchive" : "Archive"} chat
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete chat with ${chat.name}?`)) {
                deleteChat(chat.name);
                setMenuOpen(false);
              }
            }}
            className="text-left py-3 px-1 text-sm text-red-500"
          >
            🗑️ Delete chat
          </button>
        </div>
      </Modal>
    </>
  );
}
