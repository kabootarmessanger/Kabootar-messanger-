"use client";

const ITEMS = [
  { key: "gallery", icon: "🖼️", label: "Gallery", bg: "bg-violet-100", fg: "text-violet-600" },
  { key: "camera", icon: "📷", label: "Camera", bg: "bg-red-100", fg: "text-red-600" },
  { key: "video", icon: "🎬", label: "Video", bg: "bg-pink-100", fg: "text-pink-600" },
  { key: "audio", icon: "🎵", label: "Audio", bg: "bg-blue-100", fg: "text-blue-600" },
  { key: "document", icon: "📄", label: "Document", bg: "bg-sky-100", fg: "text-sky-600" },
  { key: "location", icon: "📍", label: "Location", bg: "bg-green-100", fg: "text-green-600" },
  { key: "poll", icon: "📊", label: "Poll", bg: "bg-amber-100", fg: "text-amber-600" },
  { key: "sticker", icon: "😀", label: "Sticker", bg: "bg-amber-100", fg: "text-amber-600" },
  { key: "gif", icon: "🎞️", label: "GIF", bg: "bg-violet-100", fg: "text-violet-600" },
  { key: "contact", icon: "👤", label: "Contact", bg: "bg-orange-100", fg: "text-orange-600" },
  { key: "calendar", icon: "📅", label: "Event", bg: "bg-emerald-100", fg: "text-emerald-600" },
  { key: "note", icon: "📓", label: "Note", bg: "bg-yellow-100", fg: "text-yellow-700" }
];

export default function AttachSheet({ open, onClose, onPick }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-app bg-app rounded-t-2xl p-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 rounded-full bg-app3 mx-auto mb-4" />
        <div className="grid grid-cols-4 gap-3 text-center max-h-[60vh] overflow-y-auto">
          {ITEMS.map((it) => (
            <div key={it.key} onClick={() => onPick(it.key)} className="cursor-pointer p-2 rounded-xl">
              <div className={`w-[52px] h-[52px] mx-auto mb-2 rounded-full flex items-center justify-center text-2xl ${it.bg} ${it.fg}`}>
                {it.icon}
              </div>
              <div className="text-[11px] text-app2">{it.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
