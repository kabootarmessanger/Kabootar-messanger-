"use client";

export default function ImageViewer({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-black/95 z-[700] flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl p-2">✕</button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
    </div>
  );
}
