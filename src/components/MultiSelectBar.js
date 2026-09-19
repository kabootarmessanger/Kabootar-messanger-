"use client";

export default function MultiSelectBar({ count, onCopy, onForward, onStar, onDelete, onExit }) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-app mx-auto bg-primary text-white px-5 py-3 flex justify-between items-center z-[150]">
      <div className="text-sm font-semibold">{count} selected</div>
      <div className="flex gap-4 text-xl">
        <button onClick={onCopy}>📋</button>
        <button onClick={onForward}>↪️</button>
        <button onClick={onStar}>⭐</button>
        <button onClick={onDelete}>🗑️</button>
        <button onClick={onExit}>✕</button>
      </div>
    </div>
  );
}
