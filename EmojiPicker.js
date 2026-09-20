"use client";
import { EMOJIS } from "@/data/seed";

export default function EmojiPicker({ open, onClose, onPick }) {
  if (!open) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-app mx-auto z-[100] bg-app p-3 max-h-[50vh] rounded-t-2xl shadow-2xl flex flex-col">
      <div className="flex justify-between items-center pb-2 text-sm text-app2">
        <span>Emojis</span>
        <span onClick={onClose} className="text-xl cursor-pointer">
          ✕
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1 overflow-y-auto">
        {EMOJIS.map((e, i) => (
          <span
            key={i}
            onClick={() => onPick(e)}
            className="text-2xl text-center cursor-pointer py-1.5 rounded-lg active:bg-app2"
          >
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}
