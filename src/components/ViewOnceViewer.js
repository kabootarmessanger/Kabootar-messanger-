"use client";
import { useEffect, useState } from "react";

export default function ViewOnceViewer({ media, type, onClose }) {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (!media) return;
    setCount(5);
    const iv = setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          clearInterval(iv);
          setTimeout(onClose, 50);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [media, onClose]);

  if (!media) return null;

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-black z-[800] flex flex-col items-center justify-center">
      <button onClick={onClose} className="absolute top-5 right-5 text-white text-3xl p-2 z-10">✕</button>
      <div className="absolute top-16 w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center text-primary text-xl font-bold z-10">
        {count}
      </div>
      <div className="absolute top-6 text-white/85 text-sm text-center w-full px-6">👁️ View Once — disappears after closing</div>
      {type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media} alt="" className="max-w-full max-h-[75vh] rounded-lg" />
      ) : (
        <video src={media} autoPlay controls className="max-w-full max-h-[75vh] rounded-lg" />
      )}
    </div>
  );
}
