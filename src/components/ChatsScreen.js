"use client";
import { useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import ChatItem from "./ChatItem";
import Avatar from "./Avatar";
import NewChatModal from "./NewChatModal";

const FOLDERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" }
];

export default function ChatsScreen({ onOpenChat, onAvatarClick }) {
  const { chats, profile } = useApp();
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const touchStartY = useRef(null);
  const listRef = useRef(null);

  const archivedChats = useMemo(() => chats.filter((c) => c.archived), [chats]);

  const filtered = useMemo(() => {
    return chats
      .filter((c) => !c.archived)
      .filter((c) => (folder === "unread" ? c.unread > 0 : true))
      .filter((c) => (folder === "personal" ? c.category === "personal" : true))
      .filter((c) => (folder === "work" ? c.category === "work" : true))
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  }, [chats, folder, query]);

  const counts = useMemo(
    () => ({
      all: chats.filter((c) => !c.archived).length,
      unread: chats.filter((c) => !c.archived && c.unread > 0).length,
      personal: chats.filter((c) => !c.archived && c.category === "personal").length,
      work: chats.filter((c) => !c.archived && c.category === "work").length
    }),
    [chats]
  );

  const pinnedChats = useMemo(() => chats.filter((c) => c.pinned && !c.archived), [chats]);

  const onTouchStart = (e) => {
    if (listRef.current && listRef.current.scrollTop === 0) touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (dy > 70) {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 700);
    }
    touchStartY.current = null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary px-3 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-2">
        <div className="bg-white/15 rounded-full px-3.5 py-2 flex items-center gap-2.5 flex-1">
          <span className="text-white">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm"
          />
        </div>
        <button onClick={onAvatarClick} className="shrink-0"><Avatar src={profile.avatar} name={profile.name} size={40} /></button>
      </div>
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto border-b border-app">
        {FOLDERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFolder(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
              folder === f.id ? "bg-primaryLight text-primary border-primary" : "bg-app2 text-app2 border-app"
            }`}
          >
            {f.label}
            {counts[f.id] > 0 && (
              <span className="ml-1.5 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{counts[f.id]}</span>
            )}
          </button>
        ))}
      </div>
      {refreshing && <div className="text-center text-xs text-app3 py-1.5">Refreshing…</div>}
      {archivedChats.length > 0 && (
        <div className="border-b border-app">
          <div
            onClick={() => setArchivedOpen((o) => !o)}
            className="flex items-center gap-3.5 px-4 py-3 cursor-pointer active:bg-app2"
          >
            <div className="w-12 h-12 rounded-full bg-app2 flex items-center justify-center text-xl shrink-0">📦</div>
            <div className="flex-1 text-sm font-medium text-app">Archived</div>
            <div className="text-xs text-app3">{archivedChats.length}</div>
            <span className={`text-app3 text-xs transition-transform ${archivedOpen ? "rotate-90" : ""}`}>›</span>
          </div>
          {archivedOpen && archivedChats.map((c) => <ChatItem key={c.id} chat={c} onOpen={onOpenChat} />)}
        </div>
      )}
      {pinnedChats.length > 0 && (
        <div className="flex gap-3 px-3.5 py-3 overflow-x-auto border-b border-app">
          {pinnedChats.map((c) => (
            <div key={c.id} onClick={() => onOpenChat(c.name)} className="flex flex-col items-center gap-1 shrink-0 w-16 cursor-pointer">
              <div className="relative">
                <Avatar src={c.avatar} name={c.name} size={56} />
                {c.unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-app2 truncate w-full text-center">{c.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      )}
      <div ref={listRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className="flex-1 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-8 text-app3">
            <div className="text-6xl mb-4 opacity-40">💬</div>
            <h3 className="text-lg font-medium text-app2 mb-1.5">No chats</h3>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          filtered.map((c) => <ChatItem key={c.id} chat={c} onOpen={onOpenChat} />)
        )}
      </div>
      <button
        onClick={() => setNewChatOpen(true)}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-lg active:scale-95"
      >
        ✏️
      </button>
      <NewChatModal open={newChatOpen} onClose={() => setNewChatOpen(false)} onOpenChat={onOpenChat} />
    </div>
  );
}
