# 🕊️ Kabootar Messenger — React + Next.js Edition

Original single-file HTML/JS prototype converted into a proper **Next.js 14
(App Router) + React 18 + Tailwind CSS** project, split into clean folders
(`src/components`, `src/context`, `src/data`, `src/hooks`, `src/lib`,
`public`, `functions`).

## 🗂️ Folder structure

```
kabootar-next/
├── functions/              # placeholder for future backend/serverless functions
├── public/                 # static assets (manifest, icon)
├── src/
│   ├── app/                 # Next.js App Router (layout, page, global css)
│   ├── components/          # all React UI components
│   ├── context/              # AppContext — global state (chats, messages, settings)
│   ├── data/                  # seed/demo data
│   ├── hooks/                  # useLocalStorage hook
│   └── lib/                     # small utility functions
├── package.json
├── tailwind.config.js
├── next.config.mjs
└── jsconfig.json            # "@/..." import alias -> src/
```

## ▶️ Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 — it's mobile-first (max-width 520px), so use
your browser's device toolbar or a phone to see it as intended.

Build for production:

```bash
npm run build
npm start
```

## ✅ What was fixed vs. the original HTML prototype

The original file was a single giant `index.html` (2 versions found, with
drifted/duplicated code, `prompt()`/`confirm()` based dialogs instead of real
UI, global mutable variables, and several small bugs: mismatched element
IDs between the two versions, `localStorage` calls that would throw during
server-side rendering, event-listener leaks on re-render, and features
split inconsistently across `index.html` + 2 separate CSS/JS "part" files
that had to be pasted in manually).

In this rewrite:
- **State is centralized** in `src/context/AppContext.js` using React state
  + a safe `useLocalStorage` hook (hydration-safe, won't crash on the server).
- **No more `prompt()`/`confirm()` hacks** — real modals/sheets/forms instead
  (`Modal.js`, `NewChatModal.js`, `AttachSheet.js`, `EmojiPicker.js`, etc).
- **Components are isolated & reusable** (Avatar, MessageBubble, ChatItem,
  TabBar…) instead of one 3000+ line script with string-built HTML.
- **Dark mode** uses a proper `.dark` class + CSS variables, toggled once at
  the root instead of manually flipping emoji text on every button.
- **Message send/deliver/read simulation**, replies, starring, pinning,
  reactions, polls, voice notes (via `MediaRecorder`), image sharing, location
  sharing, group creation, app-lock PIN, contact blocking, and per-chat theme
  are all implemented and wired through the shared context so state stays
  consistent across screens (no more desynced globals).

## 🧭 Scope note

This rewrite focuses on a **solid, working core**: Chats, Status, Calls,
Settings, group creation, voice notes, media/poll/location sharing, message
actions (reply/star/pin/react/edit/delete), app-lock PIN, dark mode, and
per-user profile — all with real React state instead of `prompt()` dialogs.

The original prototype also experimented with extra features (Gemini AI
chat summaries, a full business/catalog module, an in-browser photo editor,
gamified achievements, screen-share in calls). Those were **left out** to
keep this codebase clean and buildable without errors; the `functions/`
folder explains how to add a real backend if/when you want to build these
further (they'd need actual API keys / server endpoints to be more than a
demo anyway).

## 🔌 Adding a real backend

Right now all data is demo data + `localStorage`, exactly like the original
prototype (nothing is sent to a server). See `functions/README.md` for how
to add Next.js API routes or serverless functions when you're ready to wire
up real accounts, persistence, and push notifications.
