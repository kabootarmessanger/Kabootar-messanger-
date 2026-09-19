"use client";
import { useRef } from "react";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";
import { downloadJSON, downloadText } from "@/lib/utils";

export default function DataModal({ open, onClose }) {
  const { exportAllData, restoreAllData, messages, showToast } = useApp();
  const fileRef = useRef(null);

  if (!open) return null;

  const backup = () => {
    downloadJSON(`kabootar-backup-${Date.now()}.json`, exportAllData());
    showToast("Backup downloaded");
  };

  const exportTxt = () => {
    let text = "Kabootar Export\n\n";
    Object.entries(messages).forEach(([name, msgs]) => {
      text += `\n=== ${name} ===\n`;
      msgs.forEach((m) => {
        text += `[${m.time}] ${m.own ? "You" : name}: ${m.text || "[Media]"}\n`;
      });
    });
    downloadText("kabootar-chats.txt", text);
    showToast("Exported");
  };

  const handleRestore = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!window.confirm("Restore will overwrite current data. Continue?")) return;
        restoreAllData(data);
        showToast("Restored");
        onClose();
      } catch (err) {
        showToast("Invalid backup file");
      }
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  const clearCache = () => {
    if (!window.confirm("Clear all local data? This resets the app.")) return;
    window.localStorage.clear();
    window.location.reload();
  };

  const Row = ({ icon, label, onClick }) => (
    <div onClick={onClick} className="flex items-center gap-3.5 p-3.5 bg-app2 rounded-xl cursor-pointer mb-2.5">
      <div className="text-xl">{icon}</div>
      <div className="text-sm font-medium text-app">{label}</div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="💾 Data & Backup">
      <input type="file" accept=".json" ref={fileRef} className="hidden" onChange={handleRestore} />
      <Row icon="📤" label="Export Chats (TXT)" onClick={exportTxt} />
      <Row icon="💾" label="Backup All Data (JSON)" onClick={backup} />
      <Row icon="📥" label="Restore from Backup" onClick={() => fileRef.current?.click()} />
      <div onClick={clearCache} className="flex items-center gap-3.5 p-3.5 bg-red-50 rounded-xl cursor-pointer text-red-500">
        <div className="text-xl">🗑️</div>
        <div className="text-sm font-medium">Clear Cache (reset app)</div>
      </div>
    </Modal>
  );
}
