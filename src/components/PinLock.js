"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function PinLock({ pin, title = "Kabootar Locked", hint = "Enter 4-digit PIN", onUnlock, onCancel }) {
  const { playSound, haptic } = useApp();
  const [buf, setBuf] = useState("");
  const [error, setError] = useState("");

  const press = (k) => {
    if (buf.length >= 4) return;
    const next = buf + k;
    setBuf(next);
    setError("");
    haptic(15);
    playSound("lock");
    if (next.length === 4) {
      setTimeout(() => {
        if (next === pin) {
          playSound("unlock");
          onUnlock();
        } else {
          playSound("error");
          haptic([100, 50, 100]);
          setError("Wrong PIN");
          setBuf("");
        }
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 max-w-app mx-auto z-[9999] bg-primary flex items-center justify-center flex-col p-5">
      <div className="text-center text-white max-w-[300px] w-full">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-semibold mb-1.5">{title}</h2>
        <p className="text-sm opacity-80 mb-7">{hint}</p>
        <div className="flex justify-center gap-3.5 mb-7">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`w-3.5 h-3.5 rounded-full border-2 border-white ${i < buf.length ? "bg-white" : ""}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
            <button key={k} onClick={() => press(k)} className="h-[60px] rounded-full bg-white/15 text-white text-xl font-medium">
              {k}
            </button>
          ))}
          {onCancel ? (
            <button onClick={onCancel} className="h-[60px] rounded-full text-white text-sm opacity-60">✕</button>
          ) : (
            <div />
          )}
          <button onClick={() => press("0")} className="h-[60px] rounded-full bg-white/15 text-white text-xl font-medium">0</button>
          <button onClick={() => setBuf((b) => b.slice(0, -1))} className="h-[60px] rounded-full bg-white/15 text-white text-xl">⌫</button>
        </div>
        <div className="text-red-300 text-sm mt-5 h-5">{error}</div>
      </div>
    </div>
  );
}
