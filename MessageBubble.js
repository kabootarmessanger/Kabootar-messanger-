"use client";
import { useRef } from "react";

export default function MessageBubble({ msg, index, onLongPress, onVote, onImageTap, onViewOnceTap, selected, selectMode, onSelectToggle, mentioned }) {
  const timer = useRef(null);

  const start = () => {
    timer.current = setTimeout(() => onLongPress(index), 450);
  };
  const clear = () => clearTimeout(timer.current);

  const handleClick = () => {
    if (selectMode) onSelectToggle(index);
  };

  if (msg.deleted) {
    return (
      <div className={`max-w-[80%] px-2.5 py-2 rounded-lg text-sm italic opacity-50 ${msg.own ? "self-end bg-bubble-out" : "self-start bg-bubble-in"}`}>
        {msg.text || "This message was deleted"}
      </div>
    );
  }

  let body = null;

  if (msg.voice) {
    body = (
      <div className="flex items-center gap-2.5 min-w-[180px] py-1">
        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-sm cursor-pointer">▶</div>
        <div className="flex items-center gap-0.5 h-5 flex-1">
          {Array.from({ length: 20 }).map((_, j) => (
            <span key={j} className="w-[2.5px] bg-primary opacity-50 rounded" style={{ height: `${6 + Math.abs(Math.sin(j * 0.9)) * 12}px` }} />
          ))}
        </div>
        <span className="text-[11px] text-app3">{msg.voiceDuration}s</span>
      </div>
    );
  } else if (msg.poll) {
    const total = msg.poll.options.reduce((a, o) => a + o.v, 0) || 1;
    body = (
      <div className="min-w-[220px]">
        <div className="font-semibold text-sm mb-2.5">📊 {msg.poll.question}</div>
        {msg.poll.options.map((o, oi) => {
          const pct = Math.round((o.v / total) * 100);
          return (
            <div key={oi} onClick={(e) => { e.stopPropagation(); onVote(index, oi); }} className="mb-2 cursor-pointer">
              <div className="flex justify-between text-xs mb-1 text-app2">
                <span>{o.t}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
        <div className="text-[11px] opacity-70 mt-1">{total} votes</div>
      </div>
    );
  } else if (msg.viewOnce && (msg.image || msg.video)) {
    body = (
      <div onClick={(e) => { e.stopPropagation(); onViewOnceTap(msg); }} className="relative rounded-lg overflow-hidden cursor-pointer bg-app3 min-w-[180px] min-h-[100px] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {msg.image && <img src={msg.image} alt="" className="blur-2xl rounded-lg" />}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/35 font-semibold gap-1.5 text-xs">
          <div className="text-3xl">👁️</div>
          <div className="bg-primary px-2 py-0.5 rounded-full text-[10px]">View Once</div>
        </div>
      </div>
    );
  } else if (msg.image) {
    body = (
      <>
        <div className="relative">
          {msg.hd && <div className="absolute top-1.5 left-1.5 bg-emerald-500/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">HD</div>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={msg.image}
            alt=""
            onClick={(e) => { e.stopPropagation(); onImageTap(msg.image); }}
            className="max-w-full max-h-[340px] rounded-md -mt-0.5 mb-0.5 cursor-pointer"
          />
        </div>
        {msg.text && <div className="mt-1">{msg.text}</div>}
      </>
    );
  } else if (msg.gif) {
    body = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={msg.gif} alt="gif" className="max-w-full max-h-[260px] rounded-md" />
    );
  } else if (msg.sticker) {
    body = <div className="text-6xl text-center py-1">{msg.sticker}</div>;
  } else if (msg.location) {
    body = (
      <div className="w-[220px] rounded-md overflow-hidden bg-app3">
        <div className="h-[100px] bg-gradient-to-br from-green-200 to-sky-200 flex items-center justify-center text-3xl">📍</div>
        <div className="p-2 text-xs">
          <div className="font-semibold">My Location</div>
          <div className="opacity-70 mt-0.5">{msg.location.lat.toFixed(4)}, {msg.location.lng.toFixed(4)}</div>
        </div>
      </div>
    );
  } else if (msg.document) {
    body = (
      <div className="flex items-center gap-2.5 p-2 bg-black/5 rounded-lg min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg shrink-0">📄</div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium truncate">{msg.document.name}</div>
          <div className="text-[11px] text-app3 mt-0.5">{msg.document.size}</div>
        </div>
      </div>
    );
  } else if (msg.contactCard) {
    body = (
      <div className="flex items-center gap-2.5 p-2 bg-black/5 rounded-lg min-w-[200px]">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg shrink-0">👤</div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium truncate">{msg.contactCard.name}</div>
          <div className="text-[11px] text-app3 mt-0.5">{msg.contactCard.phone || "Contact card"}</div>
        </div>
      </div>
    );
  } else if (msg.event) {
    body = (
      <div className="p-2.5 bg-black/5 rounded-lg border-l-4 border-primary min-w-[200px]">
        <div className="font-semibold text-sm">📅 {msg.event.title}</div>
        <div className="text-xs text-app3 mt-1">{msg.event.date} · {msg.event.time}</div>
        {msg.event.loc && <div className="text-xs text-app2 mt-0.5">📍 {msg.event.loc}</div>}
      </div>
    );
  } else if (msg.note) {
    body = (
      <div className="p-2.5 bg-yellow-50 rounded-lg border-l-4 border-yellow-400 min-w-[180px]">
        <div className="text-xs font-semibold text-yellow-700 mb-1">📓 Note</div>
        <div className="text-sm">{msg.note}</div>
      </div>
    );
  } else if (msg.upi) {
    body = (
      <div className="p-3 bg-gradient-to-br from-primary to-[#8B4513] text-white rounded-lg min-w-[180px]">
        <div className="text-[10px] uppercase opacity-85">Payment request</div>
        <div className="text-xl font-extrabold my-1">₹{msg.upi.amount}</div>
        {msg.upi.note && <div className="text-xs opacity-90">{msg.upi.note}</div>}
      </div>
    );
  } else if (msg.product) {
    body = (
      <div className="p-2.5 bg-black/5 rounded-lg min-w-[180px]">
        <div className="text-xs font-semibold">🛒 {msg.product.name}</div>
        <div className="text-primary font-bold text-sm mt-1">₹{msg.product.price}</div>
      </div>
    );
  } else {
    body = (
      <span>
        {mentioned ? highlightMentions(msg.text) : msg.text}
      </span>
    );
  }

  const tick = msg.own ? (msg.status === "sending" ? "✓" : "✓✓") : "";
  const tickColor = msg.status === "read" ? "text-blue" : "text-app3";

  return (
    <div
      onMouseDown={start}
      onMouseUp={clear}
      onMouseLeave={clear}
      onTouchStart={start}
      onTouchEnd={clear}
      onTouchMove={clear}
      onClick={handleClick}
      className={`max-w-[80%] px-2.5 pt-1.5 pb-2 rounded-lg text-[14.5px] leading-snug shadow-sm cursor-pointer animate-msgIn relative ${
        msg.own ? "self-end bg-bubble-out rounded-tr-none" : "self-start bg-bubble-in rounded-tl-none"
      } ${selected ? "!bg-amber-200" : ""}`}
    >
      {selected && (
        <span className="absolute -top-2 -left-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow">✓</span>
      )}
      {msg.replyTo && (
        <div className="bg-black/5 px-2 py-1.5 border-l-4 border-primary rounded mb-1 text-xs">
          <div className="font-semibold text-primary mb-0.5">{msg.replyTo.who}</div>
          {msg.replyTo.text}
        </div>
      )}
      {body}
      {msg.aiTranslation && (
        <div className="mt-1.5 bg-primaryLight text-primary text-xs px-2 py-1.5 rounded-lg border-l-2 border-primary">
          🌐 {msg.aiTranslation.to}: {msg.aiTranslation.text}
        </div>
      )}
      <div className="flex items-center justify-end gap-1 text-[11px] text-app3 mt-0.5 float-right ml-2">
        {msg.starred && <span className="text-[10px]">⭐</span>}
        {msg.edited && <span className="italic">edited</span>}
        <span>{msg.time}</span>
        {tick && <span className={tickColor}>{tick}</span>}
      </div>
      {msg.reactions?.length > 0 && (
        <div className={`absolute -bottom-2.5 ${msg.own ? "left-1.5" : "right-1.5"} bg-app rounded-full px-1.5 py-0.5 shadow text-xs flex gap-0.5`}>
          {msg.reactions.slice(-3).join("")}
        </div>
      )}
    </div>
  );
}

function highlightMentions(text) {
  if (!text) return text;
  const parts = text.split(/(@\S+)/g);
  return parts.map((p, i) =>
    p.startsWith("@") ? (
      <span key={i} className="text-primary font-semibold">{p}</span>
    ) : (
      p
    )
  );
}
