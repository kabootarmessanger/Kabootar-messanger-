"use client";
import { useState } from "react";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";

async function callGemini(apiKey, prompt, system = "") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: (system ? "System: " + system + "\n\n" : "") + "User: " + prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
  };
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error("API error " + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

export function AISettingsModal({ open, onClose }) {
  const { geminiKey, setGeminiKey, showToast } = useApp();
  const [key, setKey] = useState(geminiKey);
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="🤖 Gemini AI Setup">
      <p className="text-xs text-app2 mb-3">Get a free API key from aistudio.google.com — it's stored only in your browser.</p>
      <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="AIza..." className="w-full p-3 bg-app2 rounded-xl outline-none text-app font-mono text-sm mb-3" />
      <button
        onClick={() => {
          setGeminiKey(key.trim());
          showToast(key.trim() ? "AI enabled ✨" : "Key cleared");
          onClose();
        }}
        className="w-full py-3 bg-primary text-white rounded-xl font-semibold"
      >
        Save
      </button>
    </Modal>
  );
}

export function AISummaryModal({ open, onClose, chatName, messages }) {
  const { geminiKey } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const recent = (messages || []).slice(-30).filter((m) => !m.deleted);
      const text = recent.map((m) => (m.own ? "You" : chatName) + ": " + (m.text || "[media]")).join("\n");
      const summary = await callGemini(geminiKey, "Summarize this conversation in 3-4 bullet points. Note any action items.\n\n" + text, "You summarize chat conversations.");
      setResult(summary);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  if (!open) return null;
  if (!result && !loading && !error) run();

  return (
    <Modal open={open} onClose={onClose} title="✨ AI Summary">
      {loading && <div className="text-sm text-app2 flex items-center gap-2">Analyzing…</div>}
      {error && <div className="text-sm bg-red-50 text-red-600 rounded-xl p-3">⚠️ {error}</div>}
      {result && <div className="text-sm text-app leading-relaxed whitespace-pre-wrap bg-primaryLight rounded-xl p-3.5">{result}</div>}
    </Modal>
  );
}

export { callGemini };
