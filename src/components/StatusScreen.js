"use client";
import { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import StatusViewer from "./StatusViewer";

export default function StatusScreen() {
  const { statuses, setStatuses, toggleTheme, profile, showToast } = useApp();
  const [openIdx, setOpenIdx] = useState(null);
  const fileRef = useRef(null);

  const recent = statuses.filter((s) => !s.viewed);
  const viewed = statuses.filter((s) => s.viewed);

  const openStatus = (idx) => {
    setOpenIdx(idx);
    setStatuses((s) => s.map((x, i) => (i === idx ? { ...x, viewed: true } : x)));
  };
  const closeViewer = () => setOpenIdx(null);
  const next = () => {
    if (openIdx === null) return;
    if (openIdx + 1 < statuses.length) openStatus(openIdx + 1);
    else closeViewer();
  };
  const prev = () => {
    if (openIdx === null) return;
    if (openIdx > 0) openStatus(openIdx - 1);
  };

  const addStatus = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setStatuses((s) => {
      const mine = s.find((x) => x.id === 0);
      if (mine) return s.map((x) => (x.id === 0 ? { ...x, items: [...x.items, { image: url, caption: "" }] } : x));
      return [{ id: 0, name: profile.name, avatar: profile.avatar, time: "Just now", viewed: false, items: [{ image: url, caption: "" }] }, ...s];
    });
    showToast("Status added");
    e.target.value = "";
  };

  const Row = ({ s, idx }) => (
    <div onClick={() => openStatus(idx)} className="flex items-center gap-3.5 px-4 py-2.5 cursor-pointer active:bg-app2">
      <div className={`w-14 h-14 rounded-full p-0.5 ${s.viewed ? "bg-app3" : "bg-primary"}`}>
        <div className="w-full h-full rounded-full bg-app p-0.5">
          <Avatar src={s.avatar} name={s.name} size={48} />
        </div>
      </div>
      <div className="flex-1">
        <div className="text-base font-medium text-app">{s.name}</div>
        <div className="text-sm text-app2 mt-0.5">{s.time}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={addStatus} />
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-0.5 shadow">
        <h1 className="text-xl font-semibold flex-1 px-3">Status</h1>
        <button onClick={toggleTheme} className="w-11 h-11 text-xl">🌙</button>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <div onClick={() => fileRef.current?.click()} className="flex items-center gap-3.5 px-4 py-3.5 cursor-pointer border-b border-app">
          <Avatar name={profile.name} src={profile.avatar} size={56} />
          <div>
            <div className="font-medium text-app">My Status</div>
            <div className="text-sm text-app2">Tap to add status update</div>
          </div>
        </div>
        <div className="px-4 pt-3.5 pb-2 text-xs font-semibold text-primary">Recent updates</div>
        {recent.length ? recent.map((s) => <Row key={s.id} s={s} idx={statuses.indexOf(s)} />) : (
          <div className="px-4 text-sm text-app3">No updates</div>
        )}
        <div className="px-4 pt-3.5 pb-2 text-xs font-semibold text-primary">Viewed updates</div>
        {viewed.map((s) => (
          <Row key={s.id} s={s} idx={statuses.indexOf(s)} />
        ))}
      </div>
      <button onClick={() => fileRef.current?.click()} className="absolute bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-lg active:scale-95">
        📷
      </button>
      <StatusViewer status={openIdx !== null ? statuses[openIdx] : null} onClose={closeViewer} onNext={next} onPrev={prev} />
    </div>
  );
}
