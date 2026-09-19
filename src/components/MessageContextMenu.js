"use client";

const QUICK = ["❤️", "😂", "👍", "😮", "😢", "🙏"];
const ITEMS = [
  { key: "reply", icon: "↩️", label: "Reply" },
  { key: "copy", icon: "📋", label: "Copy" },
  { key: "star", icon: "⭐", label: "Star" },
  { key: "pin", icon: "📌", label: "Pin" },
  { key: "edit", icon: "✏️", label: "Edit" },
  { key: "delete", icon: "🗑️", label: "Delete", danger: true }
];

export default function MessageContextMenu({ open, onClose, onAction, onReact }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[500]" onClick={onClose}>
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[28vh] w-[220px] bg-app rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-around px-3 py-2.5 border-b border-app">
          {QUICK.map((e) => (
            <span
              key={e}
              onClick={() => onReact(e)}
              className="text-2xl cursor-pointer p-1 rounded-full active:scale-125 transition-transform"
            >
              {e}
            </span>
          ))}
        </div>
        {ITEMS.map((it) => (
          <div
            key={it.key}
            onClick={() => onAction(it.key)}
            className={`flex items-center gap-3.5 px-4 py-3 text-[14.5px] cursor-pointer active:bg-app2 ${
              it.danger ? "text-red-500" : "text-app"
            }`}
          >
            <span className="w-5 text-center">{it.icon}</span>
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}
