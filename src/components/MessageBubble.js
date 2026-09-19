"use client";
import { useRef } from "react";

export default function MessageBubble({ msg, chatName, index, onLongPress, onVote }) {
  const timer = useRef(null);

  const start = () => {
    timer.current = setTimeout(() => onLongPress(index), 450);
  };
  const clear = () => clearTimeout(timer.current);

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
            <div key={oi} onClick={() => onVote(index, oi)} className="mb-2 cursor-pointer">
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
  } else if (msg.image) {
    // eslint-disable-next-line @next/next/no-img-element
    body = (
      <>
        <img src={msg.image} alt="" className="max-w-full max-h-[340px] rounded-md -mt-0.5 mb-0.5" />
        {msg.text && <div className="mt-1">{msg.text}</div>}
      </>
    );
  } else if (msg.sticker) {
    body = <div className="text-6xl text-center py-1">{msg.sticker}</div>;
  } else if (msg.location) {
    body = (
      <div className="w-[220px] rounded-md overflow-hidden bg-app3">
        <div className="h-[100px] bg-gradient-to-br from-green-200 to-sky-200 flex items-center justify-center text-3xl">📍</div>
        <div className="p-2 text-xs">
          <div className="font-semibold">My Location</div>
          <div className="opacity-70 mt-0.5">
            {msg.location.lat.toFixed(4)}, {msg.location.lng.toFixed(4)}
          </div>
        </div>
      </div>
    );
  } else {
    body = <span>{msg.text}</span>;
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
      className={`max-w-[80%] px-2.5 pt-1.5 pb-2 rounded-lg text-[14.5px] leading-snug shadow-sm cursor-pointer animate-msgIn relative ${
        msg.own ? "self-end bg-bubble-out rounded-tr-none" : "self-start bg-bubble-in rounded-tl-none"
      }`}
    >
      {msg.replyTo && (
        <div className="bg-black/5 px-2 py-1.5 border-l-4 border-primary rounded mb-1 text-xs">
          <div className="font-semibold text-primary mb-0.5">{msg.replyTo.who}</div>
          {msg.replyTo.text}
        </div>
      )}
      {body}
      <div className="flex items-center justify-end gap-1 text-[11px] text-app3 mt-0.5 float-right ml-2">
        {msg.starred && <span className="text-[10px]">⭐</span>}
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
