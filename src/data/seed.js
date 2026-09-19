"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CALLS, CONTACTS, INITIAL_CHATS, INITIAL_MESSAGES, STATUSES } from "@/data/seed";
import { nowTime } from "@/lib/utils";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  // ---- persisted state ----
  const [theme, setTheme] = useLocalStorage("kb_theme", "light");
  const [wallpaper, setWallpaper] = useLocalStorage("kb_wallpaper", "default");
  const [sound, setSound] = useLocalStorage("kb_sound", true);
  const [vibration, setVibration] = useLocalStorage("kb_vibration", true);
  const [ghost, setGhost] = useLocalStorage("kb_ghost", false);
  const [receipts, setReceipts] = useLocalStorage("kb_receipts", true);
  const [starred, setStarred] = useLocalStorage("kb_starred", []);
  const [pin, setPin] = useLocalStorage("kb_pin", "");
  const [chatPins, setChatPins] = useLocalStorage("kb_chat_pins", {});
  const [privateChats, setPrivateChats] = useLocalStorage("kb_private", {});
  const [blockList, setBlockList] = useLocalStorage("kb_blocklist", []);
  const [profile, setProfile] = useLocalStorage("kb_profile", {
    name: "Aarav Sharma",
    bio: "Building Kabootar 🕊️",
    handle: "@kb_aarav_01",
    avatar: ""
  });

  const [chats, setChats] = useLocalStorage("kb_chats", INITIAL_CHATS);
  const [messages, setMessages] = useLocalStorage("kb_messages", INITIAL_MESSAGES);
  const [statuses, setStatuses] = useLocalStorage("kb_statuses", STATUSES);

  // ---- ephemeral (not persisted) UI state ----
  const [toast, setToastMsg] = useState("");
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // ---- chat helpers ----
  const getMessages = useCallback((chatName) => messages[chatName] || [], [messages]);

  const markRead = useCallback(
    (chatName) => {
      setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, unread: 0 } : c)));
    },
    [setChats]
  );

  const sendMessage = useCallback(
    (chatName, msg) => {
      const time = nowTime();
      const full = { own: true, time, status: "sending", id: Date.now(), ...msg };
      setMessages((m) => ({ ...m, [chatName]: [...(m[chatName] || []), full] }));
      setChats((cs) =>
        cs.map((c) =>
          c.name === chatName
            ? { ...c, last: msg.text || previewFor(msg), time: "now", status: "sent" }
            : c
        )
      );
      // simulate delivery -> read -> auto-reply
      setTimeout(() => {
        setMessages((m) => ({
          ...m,
          [chatName]: (m[chatName] || []).map((x) => (x.id === full.id ? { ...x, status: "delivered" } : x))
        }));
      }, 600);
      setTimeout(() => {
        setMessages((m) => ({
          ...m,
          [chatName]: (m[chatName] || []).map((x) => (x.id === full.id ? { ...x, status: "read" } : x))
        }));
        setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, status: "read" } : c)));
        maybeAutoReply(chatName);
      }, 1600);
      return full;
    },
    [setMessages, setChats] // eslint-disable-line react-hooks/exhaustive-deps
  );

  function previewFor(msg) {
    if (msg.image) return "📷 Photo";
    if (msg.video) return "🎬 Video";
    if (msg.voice) return "🎙️ Voice message";
    if (msg.sticker) return msg.sticker;
    if (msg.location) return "📍 Location";
    if (msg.poll) return "📊 Poll";
    return msg.text || "";
  }

  const maybeAutoReply = useCallback(
    (chatName) => {
      if (Math.random() > 0.6) return;
      const replies = ["Got it 👍", "Cool!", "Sure", "Thanks!", "🙌", "On it!", "Sounds good"];
      const t = replies[Math.floor(Math.random() * replies.length)];
      setTimeout(() => {
        const time = nowTime();
        setMessages((m) => ({ ...m, [chatName]: [...(m[chatName] || []), { text: t, own: false, time, status: "read" }] }));
        setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, last: t, time: "now" } : c)));
      }, 1200);
    },
    [setMessages, setChats]
  );

  const deleteMessage = useCallback(
    (chatName, index) => {
      setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).filter((_, i) => i !== index) }));
    },
    [setMessages]
  );

  const editMessage = useCallback(
    (chatName, index, text) => {
      setMessages((m) => ({
        ...m,
        [chatName]: (m[chatName] || []).map((x, i) => (i === index ? { ...x, text, edited: true } : x))
      }));
    },
    [setMessages]
  );

  const toggleStar = useCallback(
    (chatName, index) => {
      setMessages((m) => {
        const list = m[chatName] || [];
        const msg = list[index];
        if (!msg) return m;
        const willStar = !msg.starred;
        setStarred((s) =>
          willStar
            ? [...s, { chat: chatName, text: msg.text || "Media", time: msg.time }]
            : s.filter((x) => !(x.chat === chatName && x.text === (msg.text || "Media")))
        );
        return { ...m, [chatName]: list.map((x, i) => (i === index ? { ...x, starred: willStar } : x)) };
      });
    },
    [setMessages, setStarred]
  );

  const togglePinMessage = useCallback(
    (chatName, index) => {
      setMessages((m) => ({
        ...m,
        [chatName]: (m[chatName] || []).map((x, i) => (i === index ? { ...x, pinned: !x.pinned } : x))
      }));
    },
    [setMessages]
  );

  const reactToMessage = useCallback(
    (chatName, index, emoji) => {
      setMessages((m) => ({
        ...m,
        [chatName]: (m[chatName] || []).map((x, i) =>
          i === index ? { ...x, reactions: [...(x.reactions || []), emoji] } : x
        )
      }));
    },
    [setMessages]
  );

  const votePoll = useCallback(
    (chatName, index, optIdx) => {
      setMessages((m) => ({
        ...m,
        [chatName]: (m[chatName] || []).map((x, i) => {
          if (i !== index || !x.poll) return x;
          const options = x.poll.options.map((o, oi) => (oi === optIdx ? { ...o, v: o.v + 1 } : o));
          return { ...x, poll: { ...x.poll, options } };
        })
      }));
    },
    [setMessages]
  );

  const clearChat = useCallback(
    (chatName) => {
      setMessages((m) => ({ ...m, [chatName]: [] }));
    },
    [setMessages]
  );

  const setChatMeta = useCallback(
    (chatName, patch) => {
      setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, ...patch } : c)));
    },
    [setChats]
  );

  const createGroup = useCallback(
    (name, memberNames) => {
      const id = Date.now();
      const newChat = {
        id,
        name,
        avatar: `https://picsum.photos/seed/group${id}/100`,
        last: "Group created",
        time: "Now",
        unread: 0,
        pinned: false,
        status: "read",
        category: "work",
        online: false,
        muted: false,
        archived: false,
        isGroup: true,
        members: [profile.name, ...memberNames],
        admins: [profile.name]
      };
      setChats((cs) => [newChat, ...cs]);
      setMessages((m) => ({
        ...m,
        [name]: [{ text: `👥 ${name} created with ${memberNames.length} members`, own: false, time: nowTime(), status: "read", system: true }]
      }));
      return newChat;
    },
    [profile.name, setChats, setMessages]
  );

  const deleteChat = useCallback(
    (chatName) => {
      setChats((cs) => cs.filter((c) => c.name !== chatName));
    },
    [setChats]
  );

  const blockContact = useCallback(
    (name) => {
      setBlockList((b) => (b.includes(name) ? b : [...b, name]));
    },
    [setBlockList]
  );
  const unblockContact = useCallback(
    (name) => {
      setBlockList((b) => b.filter((x) => x !== name));
    },
    [setBlockList]
  );

  const value = useMemo(
    () => ({
      // state
      theme,
      wallpaper,
      sound,
      vibration,
      ghost,
      receipts,
      starred,
      pin,
      chatPins,
      privateChats,
      blockList,
      profile,
      chats,
      messages,
      statuses,
      toast,
      contacts: CONTACTS,
      calls: CALLS,
      // setters
      setTheme,
      toggleTheme,
      setWallpaper,
      setSound,
      setVibration,
      setGhost,
      setReceipts,
      setPin,
      setChatPins,
      setPrivateChats,
      setProfile,
      setStatuses,
      setChats,
      showToast,
      // chat actions
      getMessages,
      markRead,
      sendMessage,
      deleteMessage,
      editMessage,
      toggleStar,
      togglePinMessage,
      reactToMessage,
      votePoll,
      clearChat,
      setChatMeta,
      createGroup,
      deleteChat,
      blockContact,
      unblockContact
    }),
    [
      theme, wallpaper, sound, vibration, ghost, receipts, starred, pin, chatPins,
      privateChats, blockList, profile, chats, messages, statuses, toast,
      setTheme, toggleTheme, setWallpaper, setSound, setVibration, setGhost, setReceipts,
      setPin, setChatPins, setPrivateChats, setProfile, setStatuses, setChats, showToast,
      getMessages, markRead, sendMessage, deleteMessage, editMessage, toggleStar,
      togglePinMessage, reactToMessage, votePoll, clearChat, setChatMeta, createGroup,
      deleteChat, blockContact, unblockContact
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

