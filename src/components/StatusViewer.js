"use client";
import { useEffect, useRef } from "react";
import Avatar from "./Avatar";

export default function StatusViewer({ status, onClose, onNext, onPrev }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!status) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onNext, 5000);
    return () => clearTimeout(timerRef.current);
  }, [status, onNext]);

  if (!status) return null;
  const item = status.items[0];

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-black z-[300] flex flex-col">
      <div className="absolute top-3 left-2 right-2 flex gap-1 z-10">
        {status.items.map((_, i) => (
          <div key={i} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-full" />
          </div>
        ))}
      </div>
      <div className="absolute top-6 left-3 right-3 flex items-center gap-2.5 z-10">
        <Avatar src={status.avatar} name={status.name} size={40} />
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm">{status.name}</div>
          <div className="text-white/80 text-xs">{status.time}</div>
        </div>
        <button onClick={onClose} className="text-white text-2xl p-1.5">
          ✕
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-contain" />
      {item.caption && (
        <div className="absolute bottom-24 left-5 right-5 text-white text-center text-base px-2">{item.caption}</div>
      )}
      <div className="absolute top-24 bottom-24 left-0 w-1/3 z-[5]" onClick={onPrev} />
      <div className="absolute top-24 bottom-24 right-0 w-1/3 z-[5]" onClick={onNext} />
    </div>
  );
}
