export function initials(name) {
  return (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatTimer(s) {
  if (s < 60) return s + " sec";
  if (s < 3600) return Math.round(s / 60) + " min";
  if (s < 86400) return Math.round(s / 3600) + " hr";
  if (s < 604800) return Math.round(s / 86400) + " days";
  if (s < 2592000) return Math.round(s / 604800) + " wk";
  return Math.round(s / 2592000) + " mo";
}

export function formatSize(b) {
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + " KB";
  return (b / 1024 / 1024).toFixed(2) + " MB";
}

export const TIMER_OPTIONS = [
  { label: "5s", seconds: 5 },
  { label: "30s", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "1 hr", seconds: 3600 },
  { label: "24 hr", seconds: 86400 },
  { label: "7 days", seconds: 604800 }
];
