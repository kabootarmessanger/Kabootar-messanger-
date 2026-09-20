"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import Modal from "./Modal";
import ImageViewer from "./ImageViewer";
import { TIMER_OPTIONS, CHAT_WALLPAPERS } from "@/data/seed";
import { formatTimer, downloadText } from "@/lib/utils";

export default function ContactInfo({ chatName, onClose, onOpenGroupInfo }) {
  const {
    chats, contacts, starred, getMessages, clearChat, blockContact, deleteChat, showToast,
    chatPins, setChatLock, removeChatLock, privateChats, setPrivateTimer, clearPrivateTimer,
    disappearingChats, setDisappearTimer, clearDisappearTimer, perChatWallpapers, setPerChatWallpapers
  } = useApp();

  const chat = chats.find((c) => c.name === chatName);
  const contact = contacts.find((c) => c.name === chatName);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [viewerImg, setViewerImg] = useState(null);
  const [lockOpen, setLockOpen] = useState(false);
  const [lockPinInput, setLockPinInput] = useState("");
  const [timerOpen, setTimerOpen] = useState(null); // "private" | "disappear" | null
  const [wallOpen, setWallOpen] = useState(false);

  if (!chat) return null;
  const msgs = getMessages(chatName);
  const mediaMsgs = msgs.filter((m) => m.image);
  const starredCount = starred.filter((s) => s.chat === chatName).length;

  const handleClear = () => {
    if (window.confirm("Clear all messages in this chat?")) {
      clearChat(chatName);
      showToast("Cleared");
    }
  };
  const handleBlock = () => {
    if (window.confirm(`Block ${chatName}?`)) {
      blockContact(chatName);
      showToast(`${chatName} blocked`);
      onClose();
    }
  };
  const handleDelete = () => {
    if (window.confirm("Delete this chat?")) {
      deleteChat(chatName);
      onClose();
    }
  };
  const exportChat = () => {
    const text = msgs.map((m) => `[${m.time}] ${m.own ? "You" : chatName}: ${m.text || "[Media]"}`).join("\n");
    downloadText(`${chatName}-chat.txt`, text);
    showToast("Exported");
  };

  const saveLockPin = () => {
    if (!/^\d{4}$/.test(lockPinInput)) return showToast("Enter a 4-digit PIN");
    setChatLock(chatName, lockPinInput);
    setLockPinInput("");
    setLockOpen(false);
    showToast("🔒 Chat locked");
  };
  const removeLock = () => {
    removeChatLock(chatName);
    setLockOpen(false);
    showToast("Lock removed");
  };

  const selectTimer = (seconds) => {
    if (timerOpen === "private") setPrivateTimer(chatName, seconds);
    else setDisappearTimer(chatName, seconds);
    showToast((timerOpen === "private" ? "🔥 Private: " : "⏱️ Disappearing: ") + formatTimer(seconds));
    setTimerOpen(null);
  };
  const clearTimerFor = () => {
    if (timerOpen === "private") clearPrivateTimer(chatName);
    else clearDisappearTimer(chatName);
    showToast("Off");
    setTimerOpen(null);
  };

  const Row = ({ icon, label, value, danger, onClick }) => (
    <div onClick={onClick} className={`flex items-center px-4 py-4 border-b border-app cursor-pointer ${danger ? "text-red-500" : "text-app"}`}>
      <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">{icon}</div>
      <div className="flex-1 text-base">{label}</div>
      {value !== undefined && <div className="text-sm text-app3 mr-2">{value}</div>}
      <div className="text-app3 text-xl">›</div>
    </div>
  );

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-app z-[250] flex flex-col overflow-y-auto">
      <div className="bg-primary text-white px-2 py-2 flex items-center gap-1">
        <div onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl cursor-pointer">←</div>
        <div className="flex-1 text-lg font-medium pl-1">{chat.isGroup ? "Group Info" : "Contact Info"}</div>
      </div>
      <div className="py-8 px-4 text-center">
        <div className="mx-auto mb-4 w-fit">
          <Avatar src={contact?.avatar || chat.avatar} name={chatName} size={100} />
        </div>
        <h2 className="text-2xl font-medium text-app mb-1.5">{chatName}</h2>
        {contact?.sub && !chat.isGroup && <div className="text-sm text-app2">{contact.sub}</div>}
        {chat.isGroup && <div className="text-sm text-app2 mt-1">{chat.members?.length || 0} members</div>}
        {chat.isGroup && (
          <button onClick={onOpenGroupInfo} className="mt-3 text-xs font-semibold text-primary bg-primaryLight px-4 py-2 rounded-full">
            Manage Group →
          </button>
        )}
      </div>

      <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Media & Starred</div>
      <Row icon="🖼️" label="Media, Links, Docs" value={mediaMsgs.length} onClick={() => setMediaOpen(true)} />
      <Row icon="⭐" label="Starred Messages" value={starredCount} />
      <Row icon="🖼️" label="Chat Wallpaper" value={perChatWallpapers[chatName] || "default"} onClick={() => setWallOpen(true)} />

      <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Security</div>
      <Row icon="🔒" label="Chat Lock" value={chatPins[chatName] ? "On" : "Off"} onClick={() => setLockOpen(true)} />
      <Row icon="🔥" label="Private Chat" value={privateChats[chatName] ? formatTimer(privateChats[chatName]) : "Off"} onClick={() => setTimerOpen("private")} />
      <Row icon="⏱️" label="Disappearing Messages" value={disappearingChats[chatName] ? formatTimer(disappearingChats[chatName]) : "Off"} onClick={() => setTimerOpen("disappear")} />

      <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Chat</div>
      <Row icon="📤" label="Export Chat" onClick={exportChat} />
      <Row icon="🗑️" label="Clear Chat" onClick={handleClear} />
      <Row icon="🚫" label="Block Contact" danger onClick={handleBlock} />
      <Row icon="❌" label="Delete Chat" danger onClick={handleDelete} />
      <div className="h-10" />

      <Modal open={mediaOpen} onClose={() => setMediaOpen(false)} title={`Media (${mediaMsgs.length})`}>
        {mediaMsgs.length === 0 ? (
          <div className="text-sm text-app3 text-center py-6">No media yet</div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {mediaMsgs.map((m, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={m.image} alt="" onClick={() => setViewerImg(m.image)} className="w-full aspect-square object-cover rounded-md cursor-pointer" />
            ))}
          </div>
        )}
      </Modal>
      <ImageViewer src={viewerImg} onClose={() => setViewerImg(null)} />

      <Modal open={lockOpen} onClose={() => setLockOpen(false)} title="🔒 Chat Lock">
        {chatPins[chatName] ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-app2">This chat is currently locked.</div>
            <button onClick={removeLock} className="py-3 bg-app2 text-red-500 rounded-xl font-semibold">Remove Lock</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              value={lockPinInput}
              onChange={(e) => setLockPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-digit PIN"
              inputMode="numeric"
              className="p-3 bg-app2 rounded-xl outline-none text-app text-center tracking-[8px] text-lg"
            />
            <button onClick={saveLockPin} className="py-3 bg-primary text-white rounded-xl font-semibold">Lock This Chat</button>
          </div>
        )}
      </Modal>

      <Modal open={!!timerOpen} onClose={() => setTimerOpen(null)} title={timerOpen === "private" ? "🔥 Private Timer" : "⏱️ Disappearing Messages"}>
        <p className="text-xs text-app2 mb-4">
          {timerOpen === "private" ? "Messages auto-delete this long after being sent/viewed." : "Messages disappear after this duration."}
        </p>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {TIMER_OPTIONS.map((o) => (
            <div key={o.seconds} onClick={() => selectTimer(o.seconds)} className="py-3.5 px-2 bg-app2 rounded-xl text-center text-sm font-semibold text-app cursor-pointer">
              {o.label}
            </div>
          ))}
        </div>
        <button onClick={clearTimerFor} className="w-full py-3 bg-app2 text-red-500 rounded-xl font-semibold">Turn Off</button>
      </Modal>

      <Modal open={wallOpen} onClose={() => setWallOpen(false)} title="🖼️ Chat Wallpaper">
        <div className="grid grid-cols-3 gap-2">
          {CHAT_WALLPAPERS.map((w) => (
            <div
              key={w.id}
              onClick={() => {
                setPerChatWallpapers((p) => ({ ...p, [chatName]: w.id }));
                setWallOpen(false);
              }}
              className="aspect-[9/16] rounded-lg cursor-pointer"
              style={{ background: w.bg }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
