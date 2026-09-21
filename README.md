<div align="center">

<img src="icon-512.png" alt="Kabootar Messenger" width="96" height="96">

# Kabootar Messenger

**A modern, privacy-first messaging & calling web app — inspired by the humble pigeon, built for instant connection.**

[![Live Demo](https://img.shields.io/badge/demo-live-C85A32?style=flat-square)](https://kabootarmessanger.github.io/Kabootar-messanger-/)
[![GitHub Pages Deploy](https://img.shields.io/github/deployments/kabootarmessanger/Kabootar-messanger-/github-pages?style=flat-square&label=deploy)](https://github.com/kabootarmessanger/Kabootar-messanger-/deployments)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)
[![Made with JavaScript](https://img.shields.io/badge/built%20with-JavaScript-F7DF1E?style=flat-square)](#tech-stack)

[**Live Demo**](https://kabootarmessanger.github.io/Kabootar-messanger-/) · [Features](#-features) · [Getting Started](#-getting-started) · [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

**Kabootar** ("pigeon" in Hindi/Urdu) is a full-featured messaging and calling web app — chats, stories, contacts, calls, and a customizable profile, wrapped in a warm terracotta design system. It ships as an installable **Progressive Web App (PWA)**, so it looks and feels like a native app on both Android and iOS.

The project exists in two forms:

| Version | Description | Location |
|---|---|---|
| **Prototype** | Single-file HTML/CSS/JS, zero dependencies, deployed live on GitHub Pages | `index.html` |
| **React Edition** | Same app rebuilt on Next.js 14 (App Router) + React 18 + Tailwind CSS + Firebase | `src/` |

---

## ✨ Features

| | |
|---|---|
| 💬 **Chats** | Search, filters (All / Unread / Personal / Work), pinned chats, unread badges |
| ✓✓ **Read Receipts** | Sent, delivered, and read ticks, WhatsApp-style |
| 😊 **Reactions** | Long-press any message to react |
| 📖 **Stories / Status** | 24-hour disappearing stories with auto-play viewer |
| 👥 **Contacts** | Registered contacts vs. invite list |
| 📞 **Calls** | Voice & video calls, All/Missed filters, incoming/outgoing history |
| 👤 **Profile & Settings** | QR code sharing, theme builder, app-lock PIN, notification controls |
| 🌐 **Installable PWA** | Add to Home Screen on Android/iOS, works offline via service worker |

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Primary — Terracotta | `#C85A32` | Buttons, accents, brand color |
| Background | `#F8FAFC` | App background |
| Success / Read Receipt | `#10B981` | Read ticks, online status |
| Dark Slate | `#0F172A` | Headings, primary text |

---

## 📱 Install as an App

1. Open the [live demo](https://kabootarmessanger.github.io/Kabootar-messanger-/) in Chrome (Android) or Safari (iOS)
2. Tap the menu (**⋮** or **Share**) → **Install app** / **Add to Home Screen**
3. Launch it like any native app — complete with its own icon and splash screen

---

## 🛠️ Tech Stack

**Prototype** (`index.html`)
- Pure HTML, CSS & vanilla JavaScript — no build step, no dependencies
- Service worker for offline support + installability

**React Edition** (`src/`)
- [Next.js 14](https://nextjs.org/) (App Router) + [React 18](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Firebase](https://firebase.google.com/) — Auth, Firestore, Storage

---

## 🚀 Getting Started

### Run the prototype
No install needed — just open `index.html` in a browser, or visit the [live demo](https://kabootarmessanger.github.io/Kabootar-messanger-/).

### Run the React edition locally
```bash
npm install
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000).

You'll need a Firebase project — see `src/lib/firebase.js` for the expected config shape.

---

## 📂 Project Structure

```
kabootar-messanger/
├── index.html             # Standalone prototype (live on GitHub Pages)
├── sw.js                  # Service worker (offline + installability)
├── manifest.json          # PWA manifest
├── functions/              # Reserved for future backend/serverless functions
├── public/                 # Static assets for the Next.js app
└── src/
    ├── app/                 # Next.js App Router (layout, pages)
    ├── components/          # ~48 React components (ChatRoom, CallScreen, etc.)
    ├── context/             # AppContext, AuthContext
    ├── data/                # Seed/demo data
    ├── hooks/               # Custom React hooks
    └── lib/                  # Firebase, i18n, sound, haptics, QR utilities
```

---

## 🗺️ Roadmap

- [x] Core UI & navigation
- [x] Chats & Stories
- [x] Installable PWA
- [ ] Real backend (Firebase persistence)
- [ ] Push notifications
- [ ] Voice & video calls (live)
- [ ] End-to-end encryption

---

## 🤝 Contributing

Issues and pull requests are welcome. If you spot a bug or have a feature idea, please open an issue on GitHub.

## 📄 License

Released under the MIT License.

---

<div align="center">
<sub>Built with 🕊️ — dil ki baat, pigeon ke saath.</sub>
</div>
