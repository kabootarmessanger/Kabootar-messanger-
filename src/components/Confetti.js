"use client";
import { useMemo } from "react";

export default function Confetti({ emoji }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        size: 14 + Math.random() * 18,
        key: i
      })),
    [emoji]
  );

  if (!emoji) return null;

  return (
    <div className="fixed inset-0 max-w-app mx-auto pointer-events-none z-[9998] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.key}
          className="absolute -top-8 animate-confetti"
          style={{ left: `${p.left}%`, fontSize: `${p.size}px`, animationDelay: `${p.delay}s` }}
        >
          {emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confettiFall 3s linear forwards;
        }
      `}</style>
    </div>
  );
}
