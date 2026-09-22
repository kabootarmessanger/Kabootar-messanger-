"use client";
import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";

function durationToSec(d) {
  if (!d) return 0;
  const [m, s] = d.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}
function secToDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function CallsScreen({ onStartCall, onAvatarClick }) {
  const { callLog, toggleTheme, profile } = useApp();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? callLog : callLog.filter((c) => c.status === "missed");

  const stats = useMemo(() => {
    const total = callLog.length;
    const video = callLog.filter((c) => c.type === "video").length;
    const missed = callLog.filter((c) => c.status === "missed").length;
    const durations = callLog.filter((c) => c.duration).map((c) => durationToSec(c.duration));
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { total, video, missed, avg: secToDuration(avg) };
  }, [callLog]);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-0.5 shadow">
        <h1 className="text-xl font-semibold flex-1 px-3">Calls</h1>
        <button onClick={onAvatarClick} className="mr-1"><Avatar src={profile.avatar} name={profile.name} size={32} /></button>
        <button onClick={toggleTheme} className="w-11 h-11 text-xl">🌙</button>
      </div>
      <div className="flex gap-2 px-3 pt-3 pb-1">
        {[
          { label: "Total", value: stats.total, icon: "📞", bg: "bg-orange-50 dark:bg-orange-500/10", fg: "text-orange-600" },
          { label: "Video", value: stats.video, icon: "📹", bg: "bg-violet-50 dark:bg-violet-500/10", fg: "text-violet-600" },
          { label: "Missed", value: stats.missed, icon: "📵", bg: "bg-red-50 dark:bg-red-500/10", fg: "text-red-500" },
          { label: "Avg", value: stats.avg, icon: "⏱️", bg: "bg-sky-50 dark:bg-sky-500/10", fg: "text-sky-600" }
        ].map((s) => (
          <div key={s.label} className={`flex-1 rounded-2xl ${s.bg} py-3 flex flex-col items-center gap-1`}>
            <span className="text-lg">{s.icon}</span>
            <span className={`text-lg font-bold ${s.fg}`}>{s.value}</span>
            <span className="text-[11px] text-app3">{s.label}</span>
          </div>
        ))}
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
              <div key={i} onClick={() => onStartCall(c.name, c.type, c.isGroup, c.members)} className="flex items-center gap-3.5 px-4 py-3 cursor-pointer active:bg-app2">
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
    </div>
  );
}
