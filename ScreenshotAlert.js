"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

export default function ScreenshotAlert() {
  const { screenshotProof, showToast, playSound, haptic } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!screenshotProof) return;
    const handler = (e) => {
      const isPrintScreen = e.key === "PrintScreen";
      const isMacShot = e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4");
      if (isPrintScreen || isMacShot) {
        setShow(true);
        playSound("error");
        haptic([200, 100, 200]);
        showToast("⚠️ Screenshot detected — sender notified");
        setTimeout(() => setShow(false), 3000);
      }
    };
    window.addEventListener("keyup", handler);
    return () => window.removeEventListener("keyup", handler);
  }, [screenshotProof, showToast, playSound, haptic]);

  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 max-w-app mx-auto bg-red-500 text-white px-4 py-3 text-center text-sm font-semibold z-[9999]">
      ⚠️ Screenshot detected — sender notified
    </div>
  );
}
