"use client";
import Avatar from "./Avatar";

export default function MentionDropdown({ open, members, contacts, onPick }) {
  if (!open || !members?.length) return null;
  return (
    <div className="absolute bottom-14 left-2 right-2 bg-app rounded-xl shadow-2xl max-h-[220px] overflow-y-auto z-[200]">
      {members.map((m) => {
        const c = contacts.find((x) => x.name === m);
        return (
          <div key={m} onClick={() => onPick(m)} className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer active:bg-app2 text-sm text-app">
            <Avatar src={c?.avatar} name={m} size={32} />
            {m}
          </div>
        );
      })}
    </div>
  );
}
