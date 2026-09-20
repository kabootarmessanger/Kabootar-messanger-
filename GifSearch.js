"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function GifSearch({ open, onClose, onPick }) {
  const { tenorKey, setTenorKey, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyInput, setKeyInput] = useState(tenorKey);

  if (!open) return null;

  const search = async () => {
    if (!tenorKey) return;
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${tenorKey}&limit=12`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (e) {
      showToast("GIF search failed");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-app bg-app rounded-t-2xl p-4 max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="w-9 h-1 rounded-full bg-app3 mx-auto mb-3" />
        {!tenorKey ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-app2">Add a free Tenor API key (from developers.google.com/tenor) to search GIFs.</p>
            <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Tenor API key" className="p-3 bg-app2 rounded-xl outline-none text-app text-sm" />
            <button onClick={() => setTenorKey(keyInput.trim())} className="py-3 bg-primary text-white rounded-xl font-semibold">Save Key</button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search GIFs..."
                className="flex-1 p-2.5 bg-app2 rounded-full outline-none text-sm text-app px-4"
              />
              <button onClick={search} className="px-4 bg-primary text-white rounded-full text-sm font-semibold">Go</button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2">
              {loading && <div className="col-span-3 text-center text-sm text-app3 py-6">Searching…</div>}
              {!loading && results.length === 0 && <div className="col-span-3 text-center text-sm text-app3 py-6">No results yet</div>}
              {results.map((g) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={g.id}
                  src={g.media_formats?.tinygif?.url}
                  alt=""
                  onClick={() => onPick(g.media_formats?.gif?.url || g.media_formats?.tinygif?.url)}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
