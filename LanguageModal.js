"use client";
import Modal from "./Modal";
import { LANGUAGES } from "../lib/i18n";
import { useApp } from "../context/AppContext";

export default function LanguageModal({ open, onClose }) {
  const { language, setLanguage } = useApp();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="🌐 Language">
      <div className="flex flex-col">
        {LANGUAGES.map((l) => (
          <div
            key={l.code}
            onClick={() => {
              setLanguage(l.code);
              onClose();
            }}
            className={`flex items-center gap-3 py-3.5 border-b border-app cursor-pointer ${language === l.code ? "bg-primaryLight -mx-6 px-6" : ""}`}
          >
            <div className="text-2xl w-10 text-center">{l.flag}</div>
            <div className="flex-1 text-sm font-medium text-app">{l.name}</div>
            {language === l.code && <div className="text-primary text-lg">✓</div>}
          </div>
        ))}
      </div>
    </Modal>
  );
}
