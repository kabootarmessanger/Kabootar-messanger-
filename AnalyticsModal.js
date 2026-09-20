"use client";
import { useMemo } from "react";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsModal({ open, onClose }) {
  const { messages, chats, callLog } = useApp();

  const stats = useMemo(() => {
    const all = Object.values(messages).flat();
    return {
      totalMsgs: all.length,
      totalChats: chats.length,
      media: all.filter((m) => m.image || m.video).length,
      voice: all.filter((m) => m.voice).length,
      calls: callLog.length
    };
  }, [messages, chats, callLog]);

  const weekData = useMemo(() => DAYS.map(() => Math.floor(Math.random() * 30) + 5), [open]); // eslint-disable-line
  const maxDay = Math.max(...weekData, 1);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="📊 Analytics">
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {[
          ["Total messages", stats.totalMsgs],
          ["Chats", stats.totalChats],
          ["Media shared", stats.media],
          ["Voice notes", stats.voice]
        ].map(([label, val]) => (
          <div key={label} className="bg-app2 rounded-xl p-3.5">
            <div className="text-xl font-bold text-primary">{val}</div>
            <div className="text-xs text-app2 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <div className="bg-app2 rounded-2xl p-4">
        <h4 className="text-xs font-semibold text-app2 uppercase tracking-wide mb-3">Weekly activity</h4>
        <div className="flex items-end gap-1 h-28">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 bg-primary rounded-t min-h-1" style={{ height: `${(d / maxDay) * 100}%` }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-app3 mt-2">
          {DAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </Modal>
  );
}
