"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import MessageContextMenu from "./MessageContextMenu";
import EmojiPicker from "./EmojiPicker";
import AttachSheet from "./AttachSheet";
import VoiceRecorder from "./VoiceRecorder";
import MediaPreview from "./MediaPreview";
import PhotoEditor from "./PhotoEditor";
import ImageViewer from "./ImageViewer";
import ViewOnceViewer from "./ViewOnceViewer";
import MultiSelectBar from "./MultiSelectBar";
import MentionDropdown from "./MentionDropdown";
import GifSearch from "./GifSearch";
import Modal from "./Modal";
import BusinessModal from "./BusinessModal";
import { QUICK_RESPONSES, CHAT_WALLPAPERS } from "@/data/seed";

export default function ChatRoom({ chatName, onClose, onOpenInfo, onStartCall }) {
  const {
    chats, contacts, getMessages, sendMessage, scheduleMessage, deleteMessage, editMessage,
    toggleStar, togglePinMessage, reactToMessage, votePoll, forwardMessage, markRead,
    showToast, drafts, saveDraft, clearDraft, perChatWallpapers, wallpaper
  } = useApp();

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [ctxIdx, setCtxIdx] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null); // {url,type,fileSize}
  const [photoEditorUrl, setPhotoEditorUrl] = useState(null);
  const [viewerImg, setViewerImg] = useState(null);
  const [viewOnceMsg, setViewOnceMsg] = useState(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIdx, setSearchIdx] = useState(0);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [forwardOpen, setForwardOpen] = useState(false);
  const [forwardTargets, setForwardTargets] = useState([]);
  const [quickOpen, setQuickOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);
  const [contactPickerOpen, setContactPickerOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);

  const scrollRef = useRef(null);
  const imageFileRef = useRef(null);
  const videoFileRef = useRef(null);
  const docFileRef = useRef(null);
  const draftLoaded = useRef(false);

  const chat = chats.find((c) => c.name === chatName);
  const contact = contacts.find((c) => c.name === chatName);
  const messages = getMessages(chatName);
  const wallId = perChatWallpapers[chatName] || wallpaper;
  const wall = CHAT_WALLPAPERS.find((w) => w.id === wallId);

  useEffect(() => {
    markRead(chatName);
    setText(drafts[chatName] || "");
    draftLoaded.current = true;
    setSelectMode(false);
    setSelected([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatName]);

  useEffect(() => {
    if (!draftLoaded.current) return;
    const id = setTimeout(() => {
      if (text.trim()) saveDraft(chatName, text);
      else clearDraft(chatName);
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const searchMatches = useMemo(() => {
    if (!searchQuery) return [];
    return messages.reduce((acc, m, i) => {
      if (m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase())) acc.push(i);
      return acc;
    }, []);
  }, [searchQuery, messages]);

  const handleSend = () => {
    if (editingIdx !== null) {
      editMessage(chatName, editingIdx, text.trim());
      setEditingIdx(null);
      setText("");
      return;
    }
    const t = text.trim();
    if (!t) {
      setRecOpen(true);
      return;
    }
    const msg = { text: t };
    if (replyTo) msg.replyTo = { who: replyTo.own ? "You" : chatName, text: replyTo.text || "Media" };
    sendMessage(chatName, msg);
    setText("");
    clearDraft(chatName);
    setReplyTo(null);
  };

  const handleVoiceSend = (sec, url) => {
    sendMessage(chatName, { text: "", voice: true, voiceDuration: sec, audioUrl: url });
    setRecOpen(false);
  };

  const openPreview = (file, type) => {
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type, fileSize: file.size });
    setAttachOpen(false);
  };
  const handleImageFile = (e) => {
    const f = e.target.files?.[0];
    if (f) openPreview(f, "image");
    e.target.value = "";
  };
  const handleVideoFile = (e) => {
    const f = e.target.files?.[0];
    if (f) openPreview(f, "video");
    e.target.value = "";
  };
  const handleDocFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const sizeKb = (f.size / 1024).toFixed(1) + " KB";
    sendMessage(chatName, { text: "", document: { name: f.name, size: sizeKb } });
    e.target.value = "";
  };

  const sendPreview = ({ caption, hd, viewOnce }) => {
    const base = { text: caption, hd, viewOnce };
    if (mediaPreview.type === "image") base.image = mediaPreview.url;
    else base.video = mediaPreview.url;
    sendMessage(chatName, base);
    setMediaPreview(null);
  };

  const handleAttachPick = (key) => {
    if (key === "gallery") imageFileRef.current?.click();
    else if (key === "camera") imageFileRef.current?.click();
    else if (key === "video") videoFileRef.current?.click();
    else if (key === "document") docFileRef.current?.click();
    else if (key === "audio") docFileRef.current?.click();
    else if (key === "gif") { setAttachOpen(false); setGifOpen(true); }
    else if (key === "location") {
      setAttachOpen(false);
      if (!navigator.geolocation) return showToast("Location not available");
      navigator.geolocation.getCurrentPosition(
        (p) => sendMessage(chatName, { text: "", location: { lat: p.coords.latitude, lng: p.coords.longitude } }),
        () => sendMessage(chatName, { text: "", location: { lat: 19.076, lng: 72.8777 } })
      );
    } else if (key === "poll") {
      setAttachOpen(false);
      const q = window.prompt("Poll question:");
      if (!q) return;
      const raw = window.prompt("Options (comma separated):", "Option A, Option B");
      const opts = (raw || "").split(",").map((s) => s.trim()).filter(Boolean);
      if (opts.length < 2) return;
      sendMessage(chatName, { text: "", poll: { question: q, options: opts.map((t) => ({ t, v: 0 })) } });
    } else if (key === "sticker") {
      sendMessage(chatName, { text: "😀", sticker: "😀" });
      setAttachOpen(false);
    } else if (key === "contact") {
      setAttachOpen(false);
      setContactPickerOpen(true);
    } else if (key === "calendar") {
      setAttachOpen(false);
      setEventFormOpen(true);
    } else if (key === "note") {
      setAttachOpen(false);
      setNoteFormOpen(true);
    } else {
      setAttachOpen(false);
    }
  };

  const onLongPress = (idx) => setCtxIdx(idx);

  const handleCtxAction = (action) => {
    const idx = ctxIdx;
    setCtxIdx(null);
    if (idx === null) return;
    const msg = messages[idx];
    if (!msg) return;
    if (action === "reply") setReplyTo(msg);
    if (action === "copy") navigator.clipboard?.writeText(msg.text || "Media").then(() => showToast("Copied"));
    if (action === "star") toggleStar(chatName, idx);
    if (action === "pin") togglePinMessage(chatName, idx);
    if (action === "edit") {
      if (!msg.own || msg.voice || msg.image || msg.poll) return showToast("Can't edit this message");
      setEditingIdx(idx);
      setText(msg.text);
    }
    if (action === "delete") deleteMessage(chatName, idx);
  };
  const handleReact = (emoji) => {
    if (ctxIdx !== null) reactToMessage(chatName, ctxIdx, emoji);
    setCtxIdx(null);
  };

  const toggleSelectIdx = (idx) => {
    setSelectMode(true);
    setSelected((s) => (s.includes(idx) ? s.filter((x) => x !== idx) : [...s, idx]));
  };
  const exitSelect = () => { setSelectMode(false); setSelected([]); };
  const multiCopy = () => {
    const text = selected.map((i) => messages[i]?.text || "[Media]").join("\n");
    navigator.clipboard?.writeText(text).then(() => showToast("Copied " + selected.length));
    exitSelect();
  };
  const multiStar = () => {
    selected.forEach((i) => { if (!messages[i]?.starred) toggleStar(chatName, i); });
    showToast("Starred " + selected.length);
    exitSelect();
  };
  const multiDelete = () => {
    if (!window.confirm(`Delete ${selected.length} messages?`)) return;
    selected.sort((a, b) => b - a).forEach((i) => deleteMessage(chatName, i));
    exitSelect();
  };
  const multiForwardOpen = () => setForwardOpen(true);
  const confirmForward = () => {
    const msgsToForward = selected.length ? selected.map((i) => messages[i]) : [messages[ctxIdx]];
    msgsToForward.forEach((m) => m && forwardMessage(m, forwardTargets));
    showToast("Forwarded");
    setForwardOpen(false);
    setForwardTargets([]);
    exitSelect();
  };

  const onInputChange = (val) => {
    setText(val);
    const match = val.match(/@(\S*)$/);
    if (chat?.isGroup && match) {
      setMentionQuery(match[1]);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  };
  const pickMention = (name) => {
    setText((t) => t.replace(/@\S*$/, "@" + name.replace(/\s/g, "_") + " "));
    setMentionOpen(false);
  };

  const submitEvent = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    sendMessage(chatName, { text: "", event: { title: f.get("title"), date: f.get("date"), time: f.get("time"), loc: f.get("loc") } });
    setEventFormOpen(false);
  };
  const submitNote = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const note = f.get("note");
    if (note) sendMessage(chatName, { text: "", note });
    setNoteFormOpen(false);
  };
  const submitSchedule = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const mins = Number(f.get("mins")) || 1;
    const msgText = f.get("text");
    if (msgText) {
      scheduleMessage(chatName, msgText, mins * 60000);
      showToast(`Scheduled in ${mins} min`);
    }
    setScheduleOpen(false);
  };

  if (!chat) return null;

  return (
    <div
      className="fixed inset-0 max-w-app mx-auto bg-chat flex flex-col z-[200]"
      style={wall ? { background: wall.bg } : undefined}
    >
      <input type="file" accept="image/*" ref={imageFileRef} className="hidden" onChange={handleImageFile} />
      <input type="file" accept="video/*" ref={videoFileRef} className="hidden" onChange={handleVideoFile} />
      <input type="file" ref={docFileRef} className="hidden" onChange={handleDocFile} />

      <div className="bg-primary text-white px-2 pt-[max(0.375rem,env(safe-area-inset-top))] pb-1.5 flex items-center gap-1 shadow shrink-0">
        {selectMode ? (
          <>
            <button onClick={exitSelect} className="w-10 h-10 flex items-center justify-center text-xl">✕</button>
            <div className="flex-1 text-sm font-medium">{selected.length} selected</div>
          </>
        ) : (
          <>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl">←</button>
            <div className="mr-2">
              <Avatar src={contact?.avatar || chat.avatar} name={chatName} size={40} />
            </div>
            <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenInfo}>
              <div className="text-base font-medium truncate">{chatName}</div>
              <div className="text-xs text-white/85">{chat.online ? "online" : "last seen recently"}</div>
            </div>
            <button onClick={() => onStartCall(chatName, "video")} className="w-10 h-10 flex items-center justify-center text-lg">📹</button>
            <button onClick={() => onStartCall(chatName, "audio")} className="w-10 h-10 flex items-center justify-center text-lg">📞</button>
            <button onClick={() => setSearchOpen((v) => !v)} className="w-10 h-10 flex items-center justify-center text-lg">🔍</button>
            <button onClick={() => setQuickOpen(true)} className="w-10 h-10 flex items-center justify-center text-lg">⋮</button>
          </>
        )}
      </div>

      {searchOpen && !selectMode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-app border-b border-app shrink-0">
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchIdx(0); }}
            placeholder="Search in chat..."
            className="flex-1 p-2.5 bg-app2 rounded-full outline-none text-sm text-app"
          />
          <span className="text-xs text-app3 px-1">{searchMatches.length ? `${searchIdx + 1}/${searchMatches.length}` : "0/0"}</span>
          <button onClick={() => setSearchIdx((i) => (i + 1) % Math.max(searchMatches.length, 1))} className="text-app2 px-1">▼</button>
          <button onClick={() => setSearchOpen(false)} className="text-app2 px-1">✕</button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        <div className="bg-amber-100/90 text-slate-600 text-xs px-3 py-1.5 rounded-lg text-center mx-auto max-w-[90%] mb-2 self-center">
          🔒 Messages are end-to-end encrypted
        </div>
        {messages.map((m, i) => (
          <div key={i} id={`msg-${i}`} className={searchMatches[searchIdx] === i ? "outline outline-2 outline-amber-400 rounded-lg" : ""}>
            <MessageBubble
              msg={m}
              index={i}
              onLongPress={onLongPress}
              onVote={(idx, oi) => votePoll(chatName, idx, oi)}
              onImageTap={(src) => setViewerImg(src)}
              onViewOnceTap={(msg) => setViewOnceMsg(msg)}
              selected={selected.includes(i)}
              selectMode={selectMode}
              onSelectToggle={toggleSelectIdx}
              mentioned={chat.isGroup}
            />
          </div>
        ))}
      </div>

      {replyTo && !selectMode && (
        <div className="bg-app px-3 py-2 border-l-4 border-primary flex items-center gap-2.5 border-t border-app shrink-0">
          <div className="flex-1 min-w-0">
            <strong className="text-primary text-xs block mb-0.5">Replying to {replyTo.own ? "yourself" : chatName}</strong>
            <div className="text-sm text-app2 truncate">{replyTo.text || "Media"}</div>
          </div>
          <span className="text-xl p-1.5 text-app2 cursor-pointer" onClick={() => setReplyTo(null)}>✕</span>
        </div>
      )}

      {!selectMode && (
        <div className="flex gap-2 px-3 py-2 overflow-x-auto bg-app border-t border-app shrink-0">
          {QUICK_RESPONSES.slice(0, 5).map((r) => (
            <div key={r} onClick={() => sendMessage(chatName, { text: r })} className="px-4 py-2 bg-app2 rounded-full text-[13.5px] font-medium whitespace-nowrap cursor-pointer border border-app">
              {r}
            </div>
          ))}
        </div>
      )}

      {!selectMode && (
        <div className="bg-app px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] flex items-end gap-1.5 shrink-0 relative">
          <MentionDropdown open={mentionOpen} members={(chat.members || []).filter((m) => m.toLowerCase().includes(mentionQuery.toLowerCase()))} contacts={contacts} onPick={pickMention} />
          <button onClick={() => setAttachOpen(true)} className="w-11 h-11 flex items-center justify-center text-xl text-app2">📎</button>
          <div className="flex-1 bg-app2 rounded-3xl px-3.5 py-2.5 flex items-center gap-2 min-h-11">
            <button onClick={() => setEmojiOpen((v) => !v)} className="text-xl opacity-60">😊</button>
            <input
              value={text}
              onChange={(e) => onInputChange(e.target.value)}
              onFocus={() => setEmojiOpen(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message"
              className="flex-1 bg-transparent outline-none text-app text-base min-w-0"
            />
          </div>
          <button onClick={handleSend} className={`w-11 h-11 flex items-center justify-center rounded-full text-xl ${text.trim() || editingIdx !== null ? "bg-primary text-white" : "text-app2"}`}>
            {editingIdx !== null ? "✓" : text.trim() ? "➤" : "🎤"}
          </button>
        </div>
      )}

      <MultiSelectBar count={selected.length} onCopy={multiCopy} onForward={multiForwardOpen} onStar={multiStar} onDelete={multiDelete} onExit={exitSelect} />

      <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onPick={(e) => setText((t) => t + e)} />
      <AttachSheet open={attachOpen} onClose={() => setAttachOpen(false)} onPick={handleAttachPick} />
      <VoiceRecorder open={recOpen} onCancel={() => setRecOpen(false)} onSend={handleVoiceSend} />
      <MessageContextMenu open={ctxIdx !== null} onClose={() => setCtxIdx(null)} onAction={handleCtxAction} onReact={handleReact} />
      <MediaPreview
        open={!!mediaPreview}
        url={mediaPreview?.url}
        type={mediaPreview?.type}
        fileSize={mediaPreview?.fileSize}
        onClose={() => setMediaPreview(null)}
        onEdit={mediaPreview?.type === "image" ? () => setPhotoEditorUrl(mediaPreview.url) : null}
        onSend={sendPreview}
      />
      <PhotoEditor
        open={!!photoEditorUrl}
        imageUrl={photoEditorUrl}
        onClose={() => setPhotoEditorUrl(null)}
        onSave={(url) => { setMediaPreview((p) => ({ ...p, url })); setPhotoEditorUrl(null); }}
      />
      <ImageViewer src={viewerImg} onClose={() => setViewerImg(null)} />
      <ViewOnceViewer
        media={viewOnceMsg?.image || viewOnceMsg?.video}
        type={viewOnceMsg?.image ? "image" : "video"}
        onClose={() => {
          if (viewOnceMsg) {
            const idx = messages.indexOf(viewOnceMsg);
            if (idx >= 0) deleteMessage(chatName, idx);
          }
          setViewOnceMsg(null);
        }}
      />
      <GifSearch open={gifOpen} onClose={() => setGifOpen(false)} onPick={(url) => { sendMessage(chatName, { text: "", gif: url }); setGifOpen(false); }} />
      <BusinessModal
        open={businessOpen}
        onClose={() => setBusinessOpen(false)}
        currentChat={chatName}
        onShareToChat={(msg) => sendMessage(chatName, msg)}
      />

      <Modal open={forwardOpen} onClose={() => setForwardOpen(false)} title="Forward to">
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-3">
          {chats.filter((c) => c.name !== chatName).map((c) => (
            <label key={c.name} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer ${forwardTargets.includes(c.name) ? "bg-primaryLight" : "bg-app2"}`}>
              <input type="checkbox" checked={forwardTargets.includes(c.name)} onChange={() => setForwardTargets((t) => (t.includes(c.name) ? t.filter((x) => x !== c.name) : [...t, c.name]))} className="w-5 h-5 accent-primary" />
              <Avatar src={c.avatar} name={c.name} size={36} />
              <span className="text-sm text-app">{c.name}</span>
            </label>
          ))}
        </div>
        <button onClick={confirmForward} disabled={!forwardTargets.length} className="w-full py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-40">Forward</button>
      </Modal>

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="Chat Menu">
        <div className="flex flex-col">
          <div onClick={() => { setQuickOpen(false); setScheduleOpen(true); }} className="py-3 border-b border-app cursor-pointer text-sm text-app">🕐 Schedule a message</div>
          <div onClick={() => { setQuickOpen(false); setBusinessOpen(true); }} className="py-3 border-b border-app cursor-pointer text-sm text-app">💼 Business Tools</div>
          <div onClick={() => { setQuickOpen(false); showToast(chat.muted ? "Unmuted" : "Muted"); }} className="py-3 border-b border-app cursor-pointer text-sm text-app">🔕 Mute / Unmute</div>
        </div>
      </Modal>

      <Modal open={eventFormOpen} onClose={() => setEventFormOpen(false)} title="📅 New Event">
        <form onSubmit={submitEvent} className="flex flex-col gap-3">
          <input name="title" placeholder="Event title" required className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <input name="date" type="date" required className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <input name="time" type="time" required className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <input name="loc" placeholder="Location (optional)" className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <button className="py-3 bg-primary text-white rounded-xl font-semibold">Send Event</button>
        </form>
      </Modal>

      <Modal open={noteFormOpen} onClose={() => setNoteFormOpen(false)} title="📓 New Note">
        <form onSubmit={submitNote} className="flex flex-col gap-3">
          <textarea name="note" rows={4} placeholder="Write a note..." required className="p-3 bg-app2 rounded-xl outline-none text-app resize-none" />
          <button className="py-3 bg-primary text-white rounded-xl font-semibold">Send Note</button>
        </form>
      </Modal>

      <Modal open={scheduleOpen} onClose={() => setScheduleOpen(false)} title="🕐 Schedule Message">
        <form onSubmit={submitSchedule} className="flex flex-col gap-3">
          <input name="text" placeholder="Message" required className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <input name="mins" type="number" min="1" defaultValue={5} placeholder="Minutes from now" className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <button className="py-3 bg-primary text-white rounded-xl font-semibold">Schedule</button>
        </form>
      </Modal>

      <Modal open={contactPickerOpen} onClose={() => setContactPickerOpen(false)} title="👤 Share Contact">
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
          {contacts.filter((c) => c.reg).map((c) => (
            <div
              key={c.name}
              onClick={() => {
                sendMessage(chatName, { text: "", contactCard: { name: c.name, phone: c.sub } });
                setContactPickerOpen(false);
              }}
              className="flex items-center gap-3 p-2.5 bg-app2 rounded-xl cursor-pointer"
            >
              <Avatar src={c.avatar} name={c.name} size={40} />
              <span className="text-sm font-medium text-app">{c.name}</span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
