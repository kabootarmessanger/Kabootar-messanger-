"use client";
import { useState } from "react";
import { formatSize } from "@/lib/utils";

export default function MediaPreview({ open, url, type, fileSize, onClose, onEdit, onSend }) {
  const [caption, setCaption] = useState("");
  const [hd, setHd] = useState(false);
  const [viewOnce, setViewOnce] = useState(false);

  if (!open) return null;

  const toggleViewOnce = () => {
    const v = !viewOnce;
    setViewOnce(v);
    if (v) setHd(false);
  };

  const handleSend = () => {
    onSend({ caption: caption.trim(), hd, viewOnce });
    setCaption("");
    setHd(false);
    setViewOnce(false);
  };

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-black z-[400] flex flex-col">
      <div className="p-3 flex items-center gap-2 text-white absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={onClose} className="w-10 h-10 text-xl">✕</button>
        <div className="flex-1 text-sm font-medium">Preview</div>
        {type === "image" && onEdit && (
          <button onClick={onEdit} className="w-10 h-10 text-lg">🖌️</button>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center p-10 relative bg-black">
        {type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="max-w-full max-h-full object-contain" style={{ filter: hd ? "contrast(1.05) saturate(1.05)" : "none" }} />
        ) : (
          <video src={url} controls autoPlay loop muted className="max-w-full max-h-full" />
        )}
        <div className={`absolute top-16 right-4 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur ${hd ? "bg-emerald-500/90" : "bg-black/60"}`}>
          {hd ? "HD" : "SD"} {fileSize ? `· ${formatSize(fileSize)}` : ""}
        </div>
      </div>
      <div className="px-4 py-3 bg-black/90">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption..."
          className="w-full bg-white/10 rounded-full px-4 py-3 text-white outline-none text-sm placeholder-white/50"
        />
      </div>
      <div className="bg-black/90 px-4 py-3 flex flex-col gap-2.5">
        <div onClick={() => setHd((v) => !v)} className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/5 cursor-pointer">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-lg">📷</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">HD Quality</div>
            <div className="text-xs text-white/60 mt-0.5">Send in high definition</div>
          </div>
          <div className={`w-12 h-7 rounded-full relative transition-colors ${hd ? "bg-emerald-500" : "bg-white/15"}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${hd ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </div>
        <div onClick={toggleViewOnce} className="flex items-center gap-3.5 p-2.5 rounded-xl bg-white/5 cursor-pointer">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-lg">👁️</div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">View Once</div>
            <div className="text-xs text-white/60 mt-0.5">Media disappears after viewing</div>
          </div>
          <div className={`w-12 h-7 rounded-full relative transition-colors ${viewOnce ? "bg-amber-500" : "bg-white/15"}`}>
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${viewOnce ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
        </div>
      </div>
      <div className="bg-black/90 px-4 py-3 flex justify-end">
        <button onClick={handleSend} className="w-14 h-14 rounded-full bg-emerald-500 text-white text-2xl flex items-center justify-center shadow-lg">
          ➤
        </button>
      </div>
    </div>
  );
}
