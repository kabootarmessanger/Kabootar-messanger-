"use client";
import { useState } from "react";
import Modal from "./Modal";
import { ACCENT_COLORS, CHAT_WALLPAPERS } from "@/data/seed";
import { useApp } from "@/context/AppContext";

export default function ThemeBuilderModal({ open, onClose }) {
  const { accent, setAccent, customTheme, setCustomTheme, wallpaper, setWallpaper, showToast } = useApp();
  const [primary, setPrimary] = useState(customTheme.primary);
  const [out, setOut] = useState(customTheme.out);
  const [inColor, setInColor] = useState(customTheme.in);

  if (!open) return null;

  const applyCustom = () => {
    setCustomTheme({ primary, out, in: inColor });
    setAccent("custom");
    showToast("Custom theme applied");
  };

  return (
    <Modal open={open} onClose={onClose} title="🎨 Theme">
      <div className="mb-5">
        <div className="text-xs font-semibold text-app2 mb-2">Accent color</div>
        <div className="grid grid-cols-4 gap-2.5">
          {ACCENT_COLORS.map((c) => (
            <div
              key={c.id}
              onClick={() => setAccent(c.id)}
              className={`h-14 rounded-xl cursor-pointer flex items-center justify-center text-white text-[10px] font-bold capitalize ${accent === c.id ? "ring-2 ring-offset-2 ring-black/30" : ""}`}
              style={{ background: c.hex }}
            >
              {accent === c.id ? "✓" : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-xs font-semibold text-app2 mb-2">Custom colors</div>
        <div className="flex flex-col gap-3">
          {[
            ["Primary", primary, setPrimary],
            ["Outgoing bubble", out, setOut],
            ["Incoming bubble", inColor, setInColor]
          ].map(([label, val, setter]) => (
            <div key={label} className="flex items-center gap-3">
              <label className="flex-1 text-sm text-app">{label}</label>
              <input type="color" value={val} onChange={(e) => setter(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer" />
            </div>
          ))}
        </div>
        <div className="rounded-xl p-3 bg-app2 my-3">
          <div className="px-3 py-2 rounded-2xl text-xs mb-1.5 max-w-[80%]" style={{ background: inColor }}>Hello! 👋</div>
          <div className="px-3 py-2 rounded-2xl text-xs max-w-[80%] ml-auto text-right" style={{ background: out }}>Hey there!</div>
        </div>
        <button onClick={applyCustom} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">Apply Custom Theme</button>
      </div>

      <div>
        <div className="text-xs font-semibold text-app2 mb-2">Default chat wallpaper</div>
        <div className="grid grid-cols-3 gap-2">
          {CHAT_WALLPAPERS.map((w) => (
            <div
              key={w.id}
              onClick={() => setWallpaper(w.id)}
              className={`aspect-[9/16] rounded-lg cursor-pointer border-2 ${wallpaper === w.id ? "border-primary" : "border-transparent"}`}
              style={{ background: w.bg }}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
