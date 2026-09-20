"use client";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { initials } from "@/lib/utils";

export default function CallScreen({ call, onEnd }) {
  const [status, setStatus] = useState("Calling…");
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [participants, setParticipants] = useState([]);

  const timerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pipRef = useRef(null);
  const dragState = useRef(null);

  const isGroup = call?.isGroup;

  useEffect(() => {
    if (!call) return;
    setStatus("Calling…");
    setSec(0);
    setMuted(false);
    setScreenSharing(false);
    setMinimized(false);
    setVideoOn(call.type === "video");

    if (isGroup) {
      setParticipants(
        (call.members || []).slice(0, 6).map((m, i) => ({ name: m, muted: i > 0 && Math.random() > 0.5, speaking: false }))
      );
    }

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: call.type === "video", audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (e) {
        // camera/mic permission denied — continue with UI-only simulation
      }
    })();

    const t1 = setTimeout(() => {
      setStatus("Connected");
      timerRef.current = setInterval(() => setSec((s) => s + 1), 1000);
    }, 1800);

    let speakerInterval;
    if (isGroup) {
      speakerInterval = setInterval(() => {
        setParticipants((ps) => ps.map((p, i) => ({ ...p, speaking: i === Math.floor(Math.random() * ps.length) })));
      }, 2500);
    }

    return () => {
      clearTimeout(t1);
      clearInterval(timerRef.current);
      clearInterval(speakerInterval);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      screenStreamRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
  };
  const toggleVideo = () => {
    const next = !videoOn;
    setVideoOn(next);
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
  };
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.style.display = "block";
        }
        stream.getVideoTracks()[0].onended = () => toggleScreenShare();
        setScreenSharing(true);
      } catch (e) {
        // user cancelled the share picker
      }
    } else {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.style.display = "none";
      setScreenSharing(false);
    }
  };

  const startDrag = (e) => {
    const rect = pipRef.current.getBoundingClientRect();
    dragState.current = { startX: e.clientX ?? e.touches[0].clientX, startY: e.clientY ?? e.touches[0].clientY, left: rect.left, top: rect.top };
  };
  const onDrag = (e) => {
    if (!dragState.current) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    const y = e.clientY ?? e.touches?.[0]?.clientY;
    if (x === undefined) return;
    const { startX, startY, left, top } = dragState.current;
    pipRef.current.style.left = left + (x - startX) + "px";
    pipRef.current.style.top = top + (y - startY) + "px";
    pipRef.current.style.right = "auto";
    pipRef.current.style.bottom = "auto";
  };
  const endDrag = () => { dragState.current = null; };

  if (!call) return null;
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  const label = status === "Connected" ? `${m}:${s}` : status;

  if (minimized) {
    return (
      <div
        ref={pipRef}
        className="fixed bottom-24 right-4 w-[110px] h-[150px] rounded-xl overflow-hidden bg-black shadow-2xl z-[1000] cursor-move"
        onMouseDown={startDrag} onMouseMove={onDrag} onMouseUp={endDrag} onMouseLeave={endDrag}
        onTouchStart={startDrag} onTouchMove={onDrag} onTouchEnd={endDrag}
      >
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <button onClick={() => setMinimized(false)} className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full">Expand</button>
        <button onClick={onEnd} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">✕</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 max-w-app mx-auto z-[400] flex flex-col text-white bg-gradient-to-b from-[#1a2a35] to-[#0d1419] pt-10 pb-10">
      <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover hidden" />
      {screenSharing && <div className="absolute top-16 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">🖥️ Sharing screen</div>}

      <div className="text-center py-4 relative z-10">
        <div className="text-2xl font-medium mb-1.5">{call.name}</div>
        <div className="text-sm text-white/70">{isGroup ? `Group · ${label}` : label}</div>
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10">
        {isGroup ? (
          <div className={`grid gap-1.5 p-2 w-full h-full ${participants.length > 4 ? "grid-cols-3" : "grid-cols-2"}`}>
            {participants.map((p, i) => (
              <div key={i} className={`relative bg-[#1a2a35] rounded-xl flex items-center justify-center min-h-[110px] ${p.speaking ? "ring-2 ring-emerald-400" : ""}`}>
                <div className="text-lg font-semibold bg-primary w-14 h-14 rounded-full flex items-center justify-center">{initials(p.name)}</div>
                <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-[10px] px-2 py-0.5 rounded-full">{p.name}</div>
                {p.muted && <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px]">🔇</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="ring-8 ring-white/10 rounded-full">
            <Avatar src={call.avatar} name={call.name} size={100} />
          </div>
        )}
      </div>

      {videoOn && !isGroup && (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-6 right-4 w-24 h-32 rounded-xl object-cover border-2 border-white/15 z-20" />
      )}

      <div className="flex justify-center gap-3.5 flex-wrap px-6 max-w-[340px] mx-auto w-full relative z-10">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full backdrop-blur flex items-center justify-center text-xl ${muted ? "bg-white text-black" : "bg-white/10"}`}>🎤</button>
        <button onClick={toggleVideo} className={`w-14 h-14 rounded-full backdrop-blur flex items-center justify-center text-xl ${videoOn ? "bg-white text-black" : "bg-white/10"}`}>📹</button>
        <button onClick={toggleScreenShare} className={`w-14 h-14 rounded-full backdrop-blur flex items-center justify-center text-xl ${screenSharing ? "bg-amber-500" : "bg-white/10"}`}>🖥️</button>
        <button onClick={() => setMinimized(true)} className="w-14 h-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-xl">⬇️</button>
        <button onClick={onEnd} className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl">📞</button>
      </div>
    </div>
  );
}
