"use client";
import Modal from "./Modal";
import { ACHIEVEMENTS } from "@/data/seed";
import { useApp } from "@/context/AppContext";

export default function AchievementsModal({ open, onClose }) {
  const { unlockedAchievements, streak } = useApp();
  return (
    <Modal open={open} onClose={onClose} title="🏆 Achievements">
      <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl px-4 py-3 mb-4">
        <span className="text-2xl">🔥</span>
        <span className="font-semibold text-sm">{streak} day streak</span>
        <span className="ml-auto text-xs opacity-90">Keep going!</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedAchievements.includes(a.id);
          return (
            <div
              key={a.id}
              className={`rounded-xl p-3 text-center ${unlocked ? "bg-primaryLight border border-primary" : "bg-app2 opacity-40"}`}
            >
              <div className="text-3xl mb-1.5">{a.icon}</div>
              <div className="text-[11px] font-semibold text-app">{a.name}</div>
              <div className="text-[9px] text-app3 mt-0.5 leading-tight">{a.desc}</div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-xs text-app3 mt-3">
        {unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked
      </div>
    </Modal>
  );
}
