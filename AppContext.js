"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  CALLS, CONTACTS, INITIAL_CHATS, INITIAL_MESSAGES, STATUSES,
  ACHIEVEMENTS, DEFAULT_CATALOG
} from "@/data/seed";
import { nowTime, todayStr, yesterdayStr } from "@/lib/utils";
import { SOUNDS } from "@/lib/sound";
import { vibrate } from "@/lib/haptics";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  // ---- persisted state ----
  const [theme, setTheme] = useLocalStorage("kb_theme", "light");
  const [accent, setAccent] = useLocalStorage("kb_accent", "terracotta");
  const [customTheme, setCustomTheme] = useLocalStorage("kb_custom_theme", { primary: "#C85A32", out: "#DCF8C6", in: "#FFFFFF" });
  const [wallpaper, setWallpaper] = useLocalStorage("kb_wallpaper", "default");
  const [perChatWallpapers, setPerChatWallpapers] = useLocalStorage("kb_chat_wall", {});
  const [fontSize, setFontSize] = useLocalStorage("kb_font_size", "medium");
  const [language, setLanguage] = useLocalStorage("kb_lang", "en");
  const [sound, setSound] = useLocalStorage("kb_sound", true);
  const [vibration, setVibration] = useLocalStorage("kb_vibration", true);
  const [ghost, setGhost] = useLocalStorage("kb_ghost", false);
  const [receipts, setReceipts] = useLocalStorage("kb_receipts", true);
  const [starred, setStarred] = useLocalStorage("kb_starred", []);
  const [pin, setPin] = useLocalStorage("kb_pin", "");
  const [chatPins, setChatPins] = useLocalStorage("kb_chat_pins", {});
  const [privateChats, setPrivateChats] = useLocalStorage("kb_private", {});
  const [disappearingChats, setDisappearingChats] = useLocalStorage("kb_disappear", {});
  const [blockList, setBlockList] = useLocalStorage("kb_blocklist", []);
  const [profile, setProfile] = useLocalStorage("kb_profile", {
    name: "Aarav Sharma", bio: "Building Kabootar 🕊️", handle: "@kb_aarav_01", avatar: ""
  });
  const [chats, setChats] = useLocalStorage("kb_chats", INITIAL_CHATS);
  const [messages, setMessages] = useLocalStorage("kb_messages", INITIAL_MESSAGES);
  const [statuses, setStatuses] = useLocalStorage("kb_statuses", STATUSES);
  const [drafts, setDrafts] = useLocalStorage("kb_drafts", {});
  const [twoFAEnabled, setTwoFAEnabled] = useLocalStorage("kb_2fa", false);
  const [backupCodes, setBackupCodes] = useLocalStorage("kb_2fa_codes", []);
  const [screenshotProof, setScreenshotProof] = useLocalStorage("kb_ss_proof", false);
  const [incognitoKeyboard, setIncognitoKeyboard] = useLocalStorage("kb_incognito", false);
  const [catalog, setCatalog] = useLocalStorage("kb_catalog", DEFAULT_CATALOG);
  const [orders, setOrders] = useLocalStorage("kb_orders", []);
  const [upiId, setUpiId] = useLocalStorage("kb_upi", "kabootar@upi");
  const [geminiKey, setGeminiKey] = useLocalStorage("kb_gemini_key", "");
  const [tenorKey, setTenorKey] = useLocalStorage("kb_tenor_key", "");
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage("kb_achievements", []);
  const [streak, setStreak] = useLocalStorage("kb_streak", 1);
  const [lastActive, setLastActive] = useLocalStorage("kb_last_active", "");
  const [onboarded, setOnboarded] = useLocalStorage("kb_onboarded", false);
  const [callLog, setCallLog] = useLocalStorage("kb_call_log", CALLS);

  // ---- ephemeral (not persisted) UI state ----
  const [toast, setToastMsg] = useState("");
  const toastTimer = useRef(null);
  const [confettiEmoji, setConfettiEmoji] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }, []);

  const play = useCallback((name) => { if (SOUNDS[name]) SOUNDS[name](); }, []); // eslint-disable-line
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const vibRef = useRef(vibration);
  vibRef.current = vibration;

  const playSound = useCallback((name) => {
    if (!soundRef.current) return;
    if (SOUNDS[name]) SOUNDS[name]();
  }, []);
  const haptic = useCallback((pattern) => {
    vibrate(pattern, vibRef.current);
  }, []);

  const fireConfetti = useCallback((emoji = "🎉") => {
    setConfettiEmoji(emoji);
    setTimeout(() => setConfettiEmoji(null), 2600);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, [setTheme]);

  // ---- streak tracking ----
  useEffect(() => {
    const today = todayStr();
    if (lastActive === today) return;
    if (lastActive === yesterdayStr()) {
      setStreak((s) => s + 1);
    } else if (lastActive !== "") {
      setStreak(1);
    }
    setLastActive(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- chat helpers ----
  const getMessages = useCallback((chatName) => messages[chatName] || [], [messages]);

  const markRead = useCallback((chatName) => {
    setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, unread: 0 } : c)));
  }, [setChats]);

  function previewFor(msg) {
    if (msg.image) return "📷 Photo";
    if (msg.video) return "🎬 Video";
    if (msg.voice) return "🎙️ Voice message";
    if (msg.sticker) return msg.sticker;
    if (msg.location) return "📍 Location";
    if (msg.poll) return "📊 Poll";
    if (msg.document) return "📄 " + (msg.document.name || "Document");
    if (msg.contactCard) return "👤 " + (msg.contactCard.name || "Contact");
    if (msg.event) return "📅 " + (msg.event.title || "Event");
    if (msg.note) return "📓 Note";
    if (msg.gif) return "GIF";
    return msg.text || "";
  }

  const checkAchievements = useCallback(() => {
    const allMsgs = Object.values(messages).flat();
    const totalMsgs = allMsgs.length;
    const voiceCount = allMsgs.filter((m) => m.voice).length;
    const mediaCount = allMsgs.filter((m) => m.image || m.video).length;
    const groupCount = chats.filter((c) => c.isGroup).length;
    const callCount = callLog.length;
    const toUnlock = [];
    if (totalMsgs >= 1) toUnlock.push("first_msg");
    if (totalMsgs >= 100) toUnlock.push("msgs_100");
    if (voiceCount >= 10) toUnlock.push("voice_10");
    if (mediaCount >= 25) toUnlock.push("media_25");
    if (streak >= 7) toUnlock.push("streak_7");
    if (streak >= 30) toUnlock.push("streak_30");
    if (starred.length >= 5) toUnlock.push("starred_5");
    if (groupCount >= 3) toUnlock.push("group_3");
    if (callCount >= 10) toUnlock.push("call_10");
    setUnlockedAchievements((prev) => {
      const fresh = toUnlock.filter((id) => !prev.includes(id));
      if (fresh.length) {
        const a = ACHIEVEMENTS.find((x) => x.id === fresh[0]);
        if (a) {
          showToast("🏆 " + a.name);
          fireConfetti("🏆");
        }
        return [...prev, ...fresh];
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, chats, callLog, streak, starred.length]);

  const maybeAutoReply = useCallback((chatName) => {
    if (Math.random() > 0.6) return;
    const replies = ["Got it 👍", "Cool!", "Sure", "Thanks!", "🙌", "On it!", "Sounds good"];
    const t = replies[Math.floor(Math.random() * replies.length)];
    setTimeout(() => {
      const time = nowTime();
      setMessages((m) => ({ ...m, [chatName]: [...(m[chatName] || []), { text: t, own: false, time, status: "read" }] }));
      setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, last: t, time: "now" } : c)));
      playSound("receive");
    }, 1200);
  }, [setMessages, setChats, playSound]);

  const sendMessage = useCallback((chatName, msg) => {
    const time = nowTime();
    const id = Date.now() + Math.random();
    const full = { own: true, time, status: "sending", id, ...msg };

    if (privateChats[chatName]) {
      const secs = privateChats[chatName];
      full.expiresAt = Date.now() + secs * 1000;
      setTimeout(() => deletePrivateMessage(chatName, id), secs * 1000);
    } else if (disappearingChats[chatName]) {
      const secs = disappearingChats[chatName];
      full.expiresAt = Date.now() + secs * 1000;
      setTimeout(() => deletePrivateMessage(chatName, id), secs * 1000);
    }

    setMessages((m) => ({ ...m, [chatName]: [...(m[chatName] || []), full] }));
    setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, last: previewFor(msg), time: "now", status: "sent" } : c)));
    playSound("send");
    haptic(20);

    if (/congrats|🎉/i.test(msg.text || "")) fireConfetti("🎉");
    if (/birthday|🎂/i.test(msg.text || "")) fireConfetti("🎂");

    setTimeout(() => {
      setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).map((x) => (x.id === id ? { ...x, status: "delivered" } : x)) }));
    }, 600);
    setTimeout(() => {
      setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).map((x) => (x.id === id ? { ...x, status: "read" } : x)) }));
      setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, status: "read" } : c)));
      maybeAutoReply(chatName);
      setTimeout(checkAchievements, 300);
    }, 1600);
    return full;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMessages, setChats, privateChats, disappearingChats, maybeAutoReply, playSound, haptic, fireConfetti]);

  const deletePrivateMessage = useCallback((chatName, id) => {
    setMessages((m) => ({
      ...m,
      [chatName]: (m[chatName] || []).map((x) =>
        x.id === id ? { ...x, deleted: true, text: "🔥 Message deleted", image: null, video: null, voice: false } : x
      )
    }));
  }, [setMessages]);

  const scheduleMessage = useCallback((chatName, text, delayMs) => {
    setTimeout(() => sendMessage(chatName, { text }), delayMs);
  }, [sendMessage]);

  const deleteMessage = useCallback((chatName, index) => {
    setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).filter((_, i) => i !== index) }));
  }, [setMessages]);

  const editMessage = useCallback((chatName, index, text) => {
    setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).map((x, i) => (i === index ? { ...x, text, edited: true } : x)) }));
  }, [setMessages]);

  const toggleStar = useCallback((chatName, index) => {
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
    setTimeout(checkAchievements, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setMessages, setStarred]);

  const togglePinMessage = useCallback((chatName, index) => {
    setMessages((m) => ({ ...m, [chatName]: (m[chatName] || []).map((x, i) => (i === index ? { ...x, pinned: !x.pinned } : x)) }));
  }, [setMessages]);

  const reactToMessage = useCallback((chatName, index, emoji) => {
    setMessages((m) => ({
      ...m,
      [chatName]: (m[chatName] || []).map((x, i) => (i === index ? { ...x, reactions: [...(x.reactions || []), emoji] } : x))
    }));
    playSound("react");
    haptic(20);
  }, [setMessages, playSound, haptic]);

  const votePoll = useCallback((chatName, index, optIdx) => {
    setMessages((m) => ({
      ...m,
      [chatName]: (m[chatName] || []).map((x, i) => {
        if (i !== index || !x.poll) return x;
        const options = x.poll.options.map((o, oi) => (oi === optIdx ? { ...o, v: o.v + 1 } : o));
        return { ...x, poll: { ...x.poll, options } };
      })
    }));
    playSound("react");
  }, [setMessages, playSound]);

  const forwardMessage = useCallback((msg, toChats) => {
    toChats.forEach((chatName) => {
      const time = nowTime();
      setMessages((m) => ({ ...m, [chatName]: [...(m[chatName] || []), { ...msg, own: true, time, status: "sent", id: Date.now() + Math.random(), starred: false, pinned: false, reactions: [] }] }));
      setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, last: previewFor(msg), time: "now" } : c)));
    });
  }, [setMessages, setChats]);

  const clearChat = useCallback((chatName) => {
    setMessages((m) => ({ ...m, [chatName]: [] }));
  }, [setMessages]);

  const setChatMeta = useCallback((chatName, patch) => {
    setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, ...patch } : c)));
  }, [setChats]);

  const createGroup = useCallback((name, memberNames) => {
    const id = Date.now();
    const newChat = {
      id, name, avatar: `https://picsum.photos/seed/group${id}/100`,
      last: "Group created", time: "Now", unread: 0, pinned: false, status: "read",
      category: "work", online: false, muted: false, archived: false, isGroup: true,
      members: [profile.name, ...memberNames], admins: [profile.name]
    };
    setChats((cs) => [newChat, ...cs]);
    setMessages((m) => ({ ...m, [name]: [{ text: `👥 ${name} created with ${memberNames.length} members`, own: false, time: nowTime(), status: "read", system: true }] }));
    setTimeout(checkAchievements, 200);
    return newChat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.name, setChats, setMessages]);

  const addGroupMembers = useCallback((chatName, names) => {
    setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, members: [...(c.members || []), ...names] } : c)));
  }, [setChats]);

  const removeGroupMember = useCallback((chatName, name) => {
    setChats((cs) => cs.map((c) => (c.name === chatName ? { ...c, members: (c.members || []).filter((m) => m !== name), admins: (c.admins || []).filter((m) => m !== name) } : c)));
  }, [setChats]);

  const renameGroup = useCallback((oldName, newName) => {
    setChats((cs) => cs.map((c) => (c.name === oldName ? { ...c, name: newName } : c)));
    setMessages((m) => {
      const { [oldName]: msgs, ...rest } = m;
      return { ...rest, [newName]: msgs || [] };
    });
  }, [setChats, setMessages]);

  const deleteChat = useCallback((chatName) => {
    setChats((cs) => cs.filter((c) => c.name !== chatName));
  }, [setChats]);

  const blockContact = useCallback((name) => {
    setBlockList((b) => (b.includes(name) ? b : [...b, name]));
  }, [setBlockList]);
  const unblockContact = useCallback((name) => {
    setBlockList((b) => b.filter((x) => x !== name));
  }, [setBlockList]);

  const saveDraft = useCallback((chatName, text) => {
    setDrafts((d) => ({ ...d, [chatName]: text }));
  }, [setDrafts]);
  const clearDraft = useCallback((chatName) => {
    setDrafts((d) => {
      const { [chatName]: _, ...rest } = d;
      return rest;
    });
  }, [setDrafts]);

  // ---- chat lock (per-chat PIN) ----
  const setChatLock = useCallback((chatName, pinValue) => {
    setChatPins((p) => ({ ...p, [chatName]: pinValue }));
  }, [setChatPins]);
  const removeChatLock = useCallback((chatName) => {
    setChatPins((p) => {
      const { [chatName]: _, ...rest } = p;
      return rest;
    });
  }, [setChatPins]);

  // ---- private / disappearing timers ----
  const setPrivateTimer = useCallback((chatName, seconds) => {
    setPrivateChats((p) => ({ ...p, [chatName]: seconds }));
  }, [setPrivateChats]);
  const clearPrivateTimer = useCallback((chatName) => {
    setPrivateChats((p) => {
      const { [chatName]: _, ...rest } = p;
      return rest;
    });
  }, [setPrivateChats]);
  const setDisappearTimer = useCallback((chatName, seconds) => {
    setDisappearingChats((p) => ({ ...p, [chatName]: seconds }));
  }, [setDisappearingChats]);
  const clearDisappearTimer = useCallback((chatName) => {
    setDisappearingChats((p) => {
      const { [chatName]: _, ...rest } = p;
      return rest;
    });
  }, [setDisappearingChats]);

  // ---- business ----
  const addProduct = useCallback((p) => setCatalog((c) => [...c, { id: Date.now(), ...p }]), [setCatalog]);
  const deleteProduct = useCallback((id) => setCatalog((c) => c.filter((p) => p.id !== id)), [setCatalog]);
  const addOrder = useCallback((o) => setOrders((os) => [...os, { id: "ORD-" + Date.now().toString().slice(-6), date: Date.now(), status: "pending", ...o }]), [setOrders]);
  const setOrderStatus = useCallback((id, status) => setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))), [setOrders]);

  // ---- calls ----
  const logCall = useCallback((entry) => {
    setCallLog((cs) => [{ ...entry }, ...cs]);
    setTimeout(checkAchievements, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCallLog]);

  // ---- backup/restore ----
  const exportAllData = useCallback(() => ({
    version: 1, date: Date.now(), chats, messages, statuses, starred, catalog, orders, profile
  }), [chats, messages, statuses, starred, catalog, orders, profile]);

  const restoreAllData = useCallback((data) => {
    if (data.chats) setChats(data.chats);
    if (data.messages) setMessages(data.messages);
    if (data.statuses) setStatuses(data.statuses);
    if (data.starred) setStarred(data.starred);
    if (data.catalog) setCatalog(data.catalog);
    if (data.orders) setOrders(data.orders);
    if (data.profile) setProfile(data.profile);
  }, [setChats, setMessages, setStatuses, setStarred, setCatalog, setOrders, setProfile]);

  const value = useMemo(() => ({
    theme, accent, customTheme, wallpaper, perChatWallpapers, fontSize, language,
    sound, vibration, ghost, receipts, starred, pin, chatPins, privateChats, disappearingChats,
    blockList, profile, chats, messages, statuses, drafts, twoFAEnabled, backupCodes,
    screenshotProof, incognitoKeyboard, catalog, orders, upiId, geminiKey, tenorKey,
    unlockedAchievements, streak, onboarded, callLog, calls: callLog, toast, confettiEmoji,
    contacts: CONTACTS,

    setTheme, toggleTheme, setAccent, setCustomTheme, setWallpaper, setPerChatWallpapers,
    setFontSize, setLanguage, setSound, setVibration, setGhost, setReceipts, setPin,
    setProfile, setStatuses, setChats, setTwoFAEnabled, setBackupCodes, setScreenshotProof,
    setIncognitoKeyboard, setUpiId, setGeminiKey, setTenorKey, setOnboarded,
    showToast, fireConfetti, playSound, haptic,

    getMessages, markRead, sendMessage, scheduleMessage, deleteMessage, editMessage,
    toggleStar, togglePinMessage, reactToMessage, votePoll, forwardMessage, clearChat,
    setChatMeta, createGroup, addGroupMembers, removeGroupMember, renameGroup, deleteChat,
    blockContact, unblockContact, saveDraft, clearDraft,
    setChatLock, removeChatLock, setPrivateTimer, clearPrivateTimer, setDisappearTimer, clearDisappearTimer,
    addProduct, deleteProduct, addOrder, setOrderStatus, logCall,
    exportAllData, restoreAllData, checkAchievements
  }), [
    theme, accent, customTheme, wallpaper, perChatWallpapers, fontSize, language,
    sound, vibration, ghost, receipts, starred, pin, chatPins, privateChats, disappearingChats,
    blockList, profile, chats, messages, statuses, drafts, twoFAEnabled, backupCodes,
    screenshotProof, incognitoKeyboard, catalog, orders, upiId, geminiKey, tenorKey,
    unlockedAchievements, streak, onboarded, callLog, toast, confettiEmoji,
    setTheme, toggleTheme, setAccent, setCustomTheme, setWallpaper, setPerChatWallpapers,
    setFontSize, setLanguage, setSound, setVibration, setGhost, setReceipts, setPin,
    setProfile, setStatuses, setChats, setTwoFAEnabled, setBackupCodes, setScreenshotProof,
    setIncognitoKeyboard, setUpiId, setGeminiKey, setTenorKey, setOnboarded,
    showToast, fireConfetti, playSound, haptic,
    getMessages, markRead, sendMessage, scheduleMessage, deleteMessage, editMessage,
    toggleStar, togglePinMessage, reactToMessage, votePoll, forwardMessage, clearChat,
    setChatMeta, createGroup, addGroupMembers, removeGroupMember, renameGroup, deleteChat,
    blockContact, unblockContact, saveDraft, clearDraft,
    setChatLock, removeChatLock, setPrivateTimer, clearPrivateTimer, setDisappearTimer, clearDisappearTimer,
    addProduct, deleteProduct, addOrder, setOrderStatus, logCall,
    exportAllData, restoreAllData, checkAchievements
  ]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
