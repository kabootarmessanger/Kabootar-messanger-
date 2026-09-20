"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";

export default function ContactsScreen({ onOpenChat }) {
  const { contacts } = useApp();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary px-3 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="bg-white/15 rounded-full px-3.5 py-2 flex items-center gap-2.5">
          <span className="text-white">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts"
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-8 text-app3">
            <div className="text-6xl mb-4 opacity-40">📇</div>
            <h3 className="text-lg font-medium text-app2 mb-1.5">No contacts</h3>
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.name}
              onClick={() => c.reg && onOpenChat(c.name)}
              className={`flex items-center gap-3.5 px-4 py-3 border-b border-app ${c.reg ? "cursor-pointer" : "opacity-60"}`}
            >
              <Avatar src={c.avatar} name={c.name} size={48} />
              <div className="flex-1">
                <div className="font-medium text-sm text-app">{c.name}</div>
                <div className="text-xs text-app3 mt-0.5">{c.sub}</div>
              </div>
              {!c.reg && <div className="text-[11px] text-app3">Invite</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
