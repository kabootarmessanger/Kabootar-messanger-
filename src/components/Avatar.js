"use client";
import { useState } from "react";
import { initials } from "@/lib/utils";

const SIZES = {
  32: "w-8 h-8 text-xs",
  40: "w-10 h-10 text-sm",
  48: "w-12 h-12 text-base",
  56: "w-14 h-14 text-lg",
  100: "w-24 h-24 text-3xl"
};

export default function Avatar({ src, name, size = 48, online = false }) {
  const [broken, setBroken] = useState(false);
  const cls = SIZES[size] || SIZES[48];
  return (
    <div className={`relative rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0 overflow-hidden ${cls}`}>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="w-full h-full object-cover rounded-full" onError={() => setBroken(true)} />
      ) : (
        initials(name)
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green rounded-full border-2 border-app" />
      )}
    </div>
  );
}
