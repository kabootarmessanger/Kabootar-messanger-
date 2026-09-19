"use client";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";

export default function CallScreen({ call, onEnd }) {
  const [status, setStatus] = useState("Calling…");
  const [sec, setSec] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!call) return;
    setStatus("Calling…");
    setSec(0);
    const t1 = setTimeout(() => {
      setStatus("Connected");
      timerRef.current = setInterval(() => setSec((s) => s + 1), 1000);
    }, 1800);
    return () => {
      clearTimeout(t1);
      clearInterval(timerRef.current);
    };
  }, [call]);

  if (!call) return null;
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  const label = status === "Connected" ? `${m}:${s}` : status;

  return (
    <div className="fixed inset-0 max-w-app mx-auto z-[400] flex flex-col text-white bg-gradient-to-b from-[#1a2a35] to-[#0d1419] pt-10 pb-10">
      <div className="text-center py-6">
        <div className="text-2xl font-medium mb-1.5">{call.name}</div>
        <div className="text-sm text-white/70">{label}</div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="ring-8 ring-white/10 rounded-full">
          <Avatar src={call.avatar} name={call.name} size={100} />
        </div>
      </div>
      <div className="flex justify-center gap-3.5 flex-wrap px-6 max-w-[320px] mx-auto w-full">
        <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xl">🎤</button>
        <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xl">📹</button>
        <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xl">🔊</button>
        <button onClick={onEnd} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl">📞</button>
      </div>
    </div>
  );
}
