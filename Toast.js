"use client";
import { useApp } from "@/context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  return (
    <div
      className={`fixed left-1/2 bottom-24 -translate-x-1/2 z-[9999] max-w-[90%] text-center px-5 py-3 rounded-full text-sm text-white bg-black/85 backdrop-blur transition-all duration-200 pointer-events-none ${
        toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {toast}
    </div>
  );
}
