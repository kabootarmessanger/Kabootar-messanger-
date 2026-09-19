"use client";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-5"
      onClick={onClose}
    >
      <div
        className="bg-app rounded-2xl p-6 max-w-[440px] w-full max-h-[85vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center text-app2 text-xl"
          onClick={onClose}
        >
          ✕
        </button>
        {title && <h3 className="text-lg font-semibold mb-4 text-app">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
