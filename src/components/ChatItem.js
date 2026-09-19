"use client";
import Avatar from "./Avatar";
import { useApp } from "@/context/AppContext";

export default function ChatItem({ chat, onOpen }) {
  const { chatPins, privateChats } = useApp();
  const tick = chat.status === "read" ? "✓✓" : chat.status === "delivered" ? "✓✓" : "";
  const isLocked = !!chatPins[chat.name];
  const isPrivate = !!privateChats[chat.name];

  return (
    <div
      onClick={() => onOpen(chat.name)}
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
  );
}
