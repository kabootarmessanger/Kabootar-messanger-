"use client";
import Modal from "./Modal";

export default function QuickMenu({ open, onClose, onAction }) {
  const items = [
    { key: "newGroup", icon: "👥", label: "New Group" },
    { key: "starred", icon: "⭐", label: "Starred Messages" },
    { key: "achievements", icon: "🏆", label: "Achievements" },
    { key: "analytics", icon: "📊", label: "Analytics" },
    { key: "business", icon: "💼", label: "Business Tools" },
    { key: "blocked", icon: "🚫", label: "Blocked Contacts" },
    { key: "markAllRead", icon: "✅", label: "Mark All Read" }
  ];
  return (
    <Modal open={open} onClose={onClose} title="Menu">
      <div className="flex flex-col">
        {items.map((it) => (
          <div
            key={it.key}
            onClick={() => {
              onAction(it.key);
              onClose();
            }}
            className="flex items-center gap-3.5 py-3 border-b border-app cursor-pointer"
          >
            <span className="text-xl w-8 text-center">{it.icon}</span>
            <span className="text-sm font-medium text-app">{it.label}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
