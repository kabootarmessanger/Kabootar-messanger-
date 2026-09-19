"use client";
import { useEffect, useRef, useState } from "react";

export default function VoiceRecorder({ open, onCancel, onSend }) {
  const [sec, setSec] = useState(0);
  const timerRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!open) return;
    setSec(0);
    timerRef.current = setInterval(() => setSec((s) => s + 1), 1000);
    (async () => {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const rec = new MediaRecorder(stream);
          chunksRef.current = [];
          rec.ondataavailable = (e) => chunksRef.current.push(e.data);
          rec.start();
          recRef.current = rec;
        }
      } catch (e) {
        // mic permission denied — still allow UI-only recording
      }
    })();
    return () => clearInterval(timerRef.current);
  }, [open]);

  const stopStream = () => {
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stream.getTracks().forEach((t) => t.stop());
      } catch (e) {}
    }
  };

  const handleCancel = () => {
    clearInterval(timerRef.current);
    if (recRef.current && recRef.current.state !== "inactive") {
      try {
        recRef.current.stop();
      } catch (e) {}
    }
    stopStream();
    onCancel();
  };

  const handleSend = () => {
    clearInterval(timerRef.current);
    const finish = (url) => onSend(sec, url);
    if (recRef.current && recRef.current.state !== "inactive") {
      recRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        finish(URL.createObjectURL(blob));
      };
      recRef.current.stop();
      stopStream();
    } else {
      finish(null);
    }
  };

  if (!open) return null;
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-app mx-auto z-[100] bg-app px-5 py-4 flex flex-col gap-3.5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-blink" />
        <div className="text-xl font-semibold text-app">
          {m}:{s}
        </div>
        <div className="ml-auto text-xs text-app3">Recording…</div>
      </div>
      <div className="flex items-center justify-center gap-1 h-14">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="w-[3px] bg-primary rounded"
            style={{ height: `${20 + Math.random() * 70}%` }}
          />
        ))}
      </div>
      <div className="flex justify-around">
        <button onClick={handleCancel} className="w-14 h-14 rounded-full bg-app2 text-red-500 text-2xl flex items-center justify-center">
          🗑️
        </button>
        <button onClick={handleSend} className="w-16 h-16 rounded-full bg-primary text-white text-2xl flex items-center justify-center">
          ➤
        </button>
      </div>
    </div>
  );
}
