"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import CallScreen from "./CallScreen";

export default function CallsScreen() {
  const { calls, toggleTheme } = useApp();
  const [filter, setFilter] = useState("all");
  const [activeCall, setActiveCall] = useState(null);

  const filtered = filter === "all" ? calls : calls.filter((c) => c.status === "missed");

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white px-2 pt-2 min-h-14 flex items-center gap-0.5 shadow">
        <h1 className="text-xl font-semibold flex-1 px-3">Calls</h1>
        <button onClick={toggleTheme} className="w-11 h-11 text-xl">🌙</button>
      </div>
      <div className="flex gap-2 px-3 py-2.5 border-b border-app">
        {["all", "missed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border capitalize ${
              filter === f ? "bg-primaryLight text-primary border-primary" : "bg-app2 text-app2 border-app"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-8 text-app3">
            <div className="text-6xl mb-4 opacity-40">📞</div>
            <h3 className="text-lg font-medium text-app2 mb-1.5">No calls</h3>
            <p className="text-sm">Your call history appears here</p>
          </div>
        ) : (
          filtered.map((c, i) => {
            const missed = c.status === "missed";
            const dir = c.status === "incoming" ? "↙️" : c.status === "outgoing" ? "↗️" : "↙️";
            return (
              <div key={i} onClick={() => setActiveCall(c)} className="flex items-center gap-3.5 px-4 py-3 cursor-pointer active:bg-app2">
                <Avatar src={c.avatar} name={c.name} size={56} />
                <div className="flex-1 min-w-0">
                  <div className={`text-base font-medium truncate ${missed ? "text-red-500" : "text-app"}`}>{c.name}</div>
                  <div className={`text-sm mt-0.5 flex items-center gap-1.5 ${missed ? "text-red-500" : "text-app2"}`}>
                    {dir} {c.time}
                    {c.duration && ` · ${c.duration}`}
                  </div>
                </div>
                <button className="text-xl text-primary p-2">{c.type === "video" ? "📹" : "📞"}</button>
              </div>
            );
          })
        )}
      </div>
      <CallScreen call={activeCall} onEnd={() => setActiveCall(null)} />
    </div>
  );
}
