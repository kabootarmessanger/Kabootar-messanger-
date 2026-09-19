"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import ChatItem from "./ChatItem";
import NewChatModal from "./NewChatModal";

const FOLDERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" }
];

export default function ChatsScreen({ onOpenChat }) {
  const { chats, toggleTheme, theme } = useApp();
  const [folder, setFolder] = useState("all");
  const [query, setQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

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

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white px-2 pt-2 min-h-14 flex items-center gap-0.5 shadow">
        <span className="text-2xl ml-1">🕊️</span>
        <h1 className="text-xl font-semibold flex-1 px-2">Kabootar</h1>
        <button onClick={toggleTheme} className="w-11 h-11 flex items-center justify-center rounded-full active:bg-white/15 text-xl">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
      <div className="bg-primary px-3 pb-2.5 pt-1.5">
        <div className="bg-white/15 rounded-full px-3.5 py-2 flex items-center gap-2.5">
          <span className="text-white">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm"
          />
        </div>
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
              <span className="ml-1.5 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {counts[f.id]}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
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
