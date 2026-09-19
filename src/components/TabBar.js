"use client";
import { useApp } from "@/context/AppContext";

const TABS = [
  { id: "chats", icon: "💬", label: "Chats" },
  { id: "status", icon: "⭕", label: "Status" },
  { id: "calls", icon: "📞", label: "Calls" },
  { id: "settings", icon: "⚙️", label: "Settings" }
];

export default function TabBar({ active, onChange }) {
  const { chats } = useApp();
  const unread = chats.reduce((a, c) => a + (c.unread || 0), 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-app mx-auto flex bg-primary z-[100]">
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-3 pb-3.5 flex flex-col items-center gap-0.5 relative ${
            active === t.id ? "text-white" : "text-white/70"
          }`}
        >
          <span className="text-xl relative">
            {t.icon}
            {t.id === "chats" && unread > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-white text-primary text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {unread}
              </span>
            )}
          </span>
          <span className="text-[11px] font-semibold">{t.label}</span>
          {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-white rounded-t" />}
        </button>
      ))}
    </div>
  );
}
