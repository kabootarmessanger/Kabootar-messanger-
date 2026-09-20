"use client";
import { useState } from "react";
import { ONBOARD_STEPS } from "@/data/seed";

export default function Onboarding({ open, onDone }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const s = ONBOARD_STEPS[step];

  const next = () => {
    if (step + 1 >= ONBOARD_STEPS.length) onDone();
    else setStep((v) => v + 1);
  };

  return (
    <div className="fixed inset-0 max-w-app mx-auto z-[9999] bg-gradient-to-br from-primary to-[#A8461F] text-white flex flex-col items-center justify-center px-6 py-10 text-center">
      <button onClick={onDone} className="absolute top-6 right-5 text-sm opacity-85">Skip</button>
      <div className="text-8xl mb-6">{s.icon}</div>
      <h1 className="text-2xl font-extrabold mb-3">{s.title}</h1>
      <p className="text-sm opacity-90 max-w-[340px] leading-relaxed mb-10">{s.desc}</p>
      <button onClick={next} className="bg-white text-primary px-11 py-3.5 rounded-full font-bold text-base">
        {step === ONBOARD_STEPS.length - 1 ? "Start Chatting" : "Continue"}
      </button>
      <div className="flex gap-2 mt-6">
        {ONBOARD_STEPS.map((_, i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
