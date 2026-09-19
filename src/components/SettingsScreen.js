"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import Modal from "./Modal";

const WALLPAPERS = [
  ["default", "Default", "#EFEAE2"],
  ["plain", "Plain", "#F0F2F5"],
  ["terracotta", "Terracotta", "#FDF2EE"],
  ["forest", "Forest", "#E7F0E7"],
  ["ocean", "Ocean", "#E0F2FE"],
  ["dark", "Dark", "#0B141A"]
];

export default function SettingsScreen() {
  const {
    profile, setProfile, theme, toggleTheme, wallpaper, setWallpaper,
    sound, setSound, vibration, setVibration, ghost, setGhost, receipts, setReceipts,
    starred, blockList, unblockContact, pin, setPin, showToast
  } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [wallOpen, setWallOpen] = useState(false);
  const [starredOpen, setStarredOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);

  const saveProfile = () => {
    setProfile({ ...profile, name, bio });
    setEditOpen(false);
    showToast("Profile updated");
  };

  const saveWall = (id) => {
    setWallpaper(id);
    setWallOpen(false);
  };

  const savePin = () => {
    if (!/^\d{4}$/.test(pinInput)) return showToast("Enter a 4-digit PIN");
    setPin(pinInput);
    setPinInput("");
    setPinOpen(false);
    showToast("App Lock enabled");
  };
  const removePin = () => {
    setPin("");
    setPinOpen(false);
    showToast("App Lock removed");
  };

  const Row = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className="flex items-center px-4 py-4 border-b border-app cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">{icon}</div>
      <div className="flex-1 text-base text-app">{label}</div>
      {value !== undefined && <div className="text-sm text-app3 mr-2">{value}</div>}
      <div className="text-app3 text-xl">›</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white px-2 pt-2 min-h-14 flex items-center gap-0.5 shadow">
        <h1 className="text-xl font-semibold flex-1 px-3">Settings</h1>
        <button onClick={toggleTheme} className="w-11 h-11 text-xl">🌙</button>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="py-8 px-4 text-center">
          <div className="mx-auto mb-4 w-fit" onClick={() => setEditOpen(true)}>
            <Avatar src={profile.avatar} name={profile.name} size={100} />
          </div>
          <h2 className="text-2xl font-medium text-app mb-1.5">{profile.name}</h2>
          <div className="text-sm text-app2">{profile.bio}</div>
          <div className="text-xs text-primary font-semibold mt-1.5">{profile.handle}</div>
        </div>

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Account</div>
        <Row icon="👤" label="Edit Profile" onClick={() => setEditOpen(true)} />
        <Row icon="🔐" label="App Lock" value={pin ? "On" : "Off"} onClick={() => setPinOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Privacy</div>
        <Row icon="👻" label="Ghost Mode" value={ghost ? "On" : "Off"} onClick={() => setGhost((v) => !v)} />
        <Row icon="✓✓" label="Read Receipts" value={receipts ? "On" : "Off"} onClick={() => setReceipts((v) => !v)} />
        <Row icon="🚫" label="Blocked Contacts" value={blockList.length} onClick={() => setBlockedOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Appearance</div>
        <Row icon="🌙" label="Dark Mode" value={theme === "dark" ? "On" : "Off"} onClick={toggleTheme} />
        <Row icon="🖼️" label="Chat Wallpaper" value={wallpaper} onClick={() => setWallOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Chats</div>
        <Row icon="⭐" label="Starred Messages" value={starred.length} onClick={() => setStarredOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Notifications</div>
        <Row icon="🔔" label="Sound" value={sound ? "On" : "Off"} onClick={() => setSound((v) => !v)} />
        <Row icon="📳" label="Vibration" value={vibration ? "On" : "Off"} onClick={() => setVibration((v) => !v)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">App</div>
        <Row icon="ℹ️" label="About" onClick={() => setAboutOpen(true)} />

        <div className="m-6 p-4 bg-app rounded-xl text-center text-red-500 font-semibold border border-red-200 cursor-pointer" onClick={() => showToast("Logged out")}>
          Log Out
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-3 bg-app2 rounded-xl outline-none text-app" />
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Bio" rows={3} className="p-3 bg-app2 rounded-xl outline-none text-app resize-none" />
          <button onClick={saveProfile} className="py-3 bg-primary text-white rounded-xl font-semibold">Save</button>
        </div>
      </Modal>

      <Modal open={wallOpen} onClose={() => setWallOpen(false)} title="Chat Wallpaper">
        <div className="grid grid-cols-2 gap-3">
          {WALLPAPERS.map(([id, label, color]) => (
            <div
              key={id}
              onClick={() => saveWall(id)}
              className="h-[90px] rounded-xl flex items-center justify-center text-sm font-semibold cursor-pointer"
              style={{ background: color, color: id === "dark" ? "#FFF" : "#111B21" }}
            >
              {label}
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={starredOpen} onClose={() => setStarredOpen(false)} title="⭐ Starred Messages">
        {starred.length === 0 ? (
          <div className="text-sm text-app3 text-center py-6">No starred messages</div>
        ) : (
          starred.map((s, i) => (
            <div key={i} className="p-3 bg-app2 rounded-xl mb-2">
              <div className="text-xs font-semibold text-primary mb-1">{s.chat}</div>
              <div className="text-sm text-app">{s.text}</div>
              <div className="text-[11px] text-app3 mt-1.5">{s.time}</div>
            </div>
          ))
        )}
      </Modal>

      <Modal open={blockedOpen} onClose={() => setBlockedOpen(false)} title="🚫 Blocked Contacts">
        {blockList.length === 0 ? (
          <div className="text-sm text-app3 text-center py-6">No blocked contacts</div>
        ) : (
          blockList.map((b) => (
            <div key={b} className="flex items-center gap-3 p-3 border-b border-app">
              <div className="flex-1 text-sm font-medium text-app">{b}</div>
              <button onClick={() => unblockContact(b)} className="px-3.5 py-2 bg-app2 rounded-lg text-xs font-semibold text-primary">
                Unblock
              </button>
            </div>
          ))
        )}
      </Modal>

      <Modal open={pinOpen} onClose={() => setPinOpen(false)} title="🔐 App Lock">
        {pin ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-app2">App Lock is currently ON.</div>
            <button onClick={removePin} className="py-3 bg-app2 text-red-500 rounded-xl font-semibold">
              Remove App Lock
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-digit PIN"
              inputMode="numeric"
              className="p-3 bg-app2 rounded-xl outline-none text-app text-center tracking-[8px] text-lg"
            />
            <button onClick={savePin} className="py-3 bg-primary text-white rounded-xl font-semibold">
              Enable App Lock
            </button>
          </div>
        )}
      </Modal>

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title="About Kabootar">
        <div className="text-center py-4">
          <div className="text-5xl mb-3">🕊️</div>
          <p className="font-semibold text-lg text-app mb-1.5">Kabootar Messenger</p>
          <p className="text-sm text-app2">Version 1.0.0 · Next.js Edition</p>
          <p className="text-sm text-app2 mt-4 leading-relaxed">A modern, private, fast messaging app built with React &amp; Next.js.</p>
        </div>
      </Modal>
    </div>
  );
}
