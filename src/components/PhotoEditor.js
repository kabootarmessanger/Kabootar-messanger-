"use client";
import { useEffect, useRef, useState } from "react";
import { PE_FILTERS } from "@/data/seed";

const DRAW_COLORS = ["#C85A32", "#FFFFFF", "#000000", "#FF3B30", "#34C759", "#007AFF", "#FFCC00", "#AF52DE"];

export default function PhotoEditor({ open, imageUrl, onClose, onSave }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [mode, setMode] = useState("filter");
  const [filter, setFilter] = useState("none");
  const [color, setColor] = useState(DRAW_COLORS[0]);
  const drawingRef = useRef(false);

  useEffect(() => {
    if (!open || !imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setFilter("none");
    };
    img.src = imageUrl;
  }, [open, imageUrl]);

  const rotate = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const w = canvas.width;
    const h = canvas.height;
    canvas.width = h;
    canvas.height = w;
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.translate(h / 2, w / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
    // keep rotated result as new base image for further rotation/draw
    imgRef.current = new Image();
    imgRef.current.src = canvas.toDataURL();
  };

  const resetAll = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    setFilter("none");
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    if (mode !== "draw") return;
    drawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const moveDraw = (e) => {
    if (mode !== "draw" || !drawingRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(4, canvasRef.current.width / 200);
    ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const endDraw = () => { drawingRef.current = false; };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      onSave(url);
    }, "image/jpeg", 0.9);
  };

  if (!open) return null;
  const activeFilter = PE_FILTERS.find((f) => f.id === filter);

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-black z-[500] flex flex-col">
      <div className="p-3 flex items-center gap-3 text-white bg-black">
        <button onClick={onClose} className="text-xl w-9">✕</button>
        <div className="flex-1 text-base font-semibold">Edit Photo</div>
        <button onClick={save} className="bg-primary px-4 py-2 rounded-full text-sm font-semibold">Done</button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-black p-2">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={endDraw}
          style={{ filter: activeFilter?.css || "none", maxWidth: "100%", maxHeight: "100%", touchAction: "none" }}
        />
      </div>
      <div className="bg-black px-4 py-3 flex flex-col gap-2.5">
        <div className="flex gap-2 overflow-x-auto">
          {["filter", "draw", "rotate", "reset"].map((m) => (
            <button
              key={m}
              onClick={() => (m === "rotate" ? rotate() : m === "reset" ? resetAll() : setMode(m))}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap border-2 ${
                mode === m ? "bg-primary border-primary text-white" : "bg-white/10 border-transparent text-white"
              }`}
            >
              {m === "filter" ? "✨ Filters" : m === "draw" ? "🖌️ Draw" : m === "rotate" ? "🔄 Rotate" : "↺ Reset"}
            </button>
          ))}
        </div>
        {mode === "filter" && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {PE_FILTERS.map((f) => (
              <div key={f.id} onClick={() => setFilter(f.id)} className="shrink-0 w-16 text-center cursor-pointer">
                <div
                  className={`w-15 h-15 w-[60px] h-[60px] rounded-lg bg-cover bg-center border-2 mb-1 ${filter === f.id ? "border-primary" : "border-transparent"}`}
                  style={{ backgroundImage: `url(${imageUrl})`, filter: f.css }}
                />
                <div className="text-[10px] text-white/80">{f.label}</div>
              </div>
            ))}
          </div>
        )}
        {mode === "draw" && (
          <div className="flex gap-2">
            {DRAW_COLORS.map((c) => (
              <div
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full cursor-pointer border-2 ${color === c ? "border-white scale-110" : "border-white/30"}`}
                style={{ background: c }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
