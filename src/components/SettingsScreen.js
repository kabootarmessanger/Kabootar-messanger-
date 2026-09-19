"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import Modal from "./Modal";
import ThemeBuilderModal from "./ThemeBuilderModal";
import LanguageModal from "./LanguageModal";
import DataModal from "./DataModal";
import QRCodeModal from "./QRCodeModal";
import AchievementsModal from "./AchievementsModal";
import AnalyticsModal from "./AnalyticsModal";
import BusinessModal from "./BusinessModal";
import BlockedContactsModal from "./BlockedContactsModal";
import { AISettingsModal } from "./AIModals";
import { FONT_SIZES } from "@/data/seed";

export default function SettingsScreen() {
  const {
    profile, setProfile, theme, toggleTheme, fontSize, setFontSize,
    sound, setSound, vibration, setVibration, ghost, setGhost, receipts, setReceipts,
    starred, blockList, pin, setPin, showToast,
    twoFAEnabled, setTwoFAEnabled, backupCodes, setBackupCodes,
    screenshotProof, setScreenshotProof, incognitoKeyboard, setIncognitoKeyboard,
    geminiKey, unlockedAchievements
  } = useApp();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [starredOpen, setStarredOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [achOpen, setAchOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [businessOpen, setBusinessOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);

  const saveProfile = () => {
    setProfile({ ...profile, name, bio });
    setEditOpen(false);
    showToast("Profile updated");
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

  const enable2FA = () => {
    const codes = Array.from({ length: 6 }, () => Math.random().toString(36).slice(2, 8).toUpperCase());
    setBackupCodes(codes);
    setTwoFAEnabled(true);
    showToast("2FA enabled");
  };
  const disable2FA = () => {
    setTwoFAEnabled(false);
    setBackupCodes([]);
    showToast("2FA disabled");
  };

  const Row = ({ icon, label, value, onClick }) => (
    <div onClick={onClick} className="flex items-center px-4 py-4 border-b border-app cursor-pointer">
      <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">{icon}</div>
      <div className="flex-1 text-base text-app">{label}</div>
      {value !== undefined && <div className="text-sm text-app3 mr-2">{value}</div>}
      <div className="text-app3 text-xl">›</div>
    </div>
  );

  const Toggle = ({ on, onClick }) => (
    <div onClick={onClick} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-primary" : "bg-app3"}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white px-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-14 flex items-center gap-0.5 shadow">
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

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Business</div>
        <Row icon="💼" label="Business Tools" onClick={() => setBusinessOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Account</div>
        <Row icon="👤" label="Edit Profile" onClick={() => setEditOpen(true)} />
        <Row icon="📱" label="Show QR Code" onClick={() => setQrOpen(true)} />
        <Row icon="🔐" label="App Lock" value={pin ? "On" : "Off"} onClick={() => setPinOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">AI &amp; Privacy</div>
        <Row icon="🤖" label="AI Settings (Gemini)" value={geminiKey ? "On" : "Off"} onClick={() => setAiOpen(true)} />
        <Row icon="👻" label="Ghost Mode" value={ghost ? "On" : "Off"} onClick={() => setGhost((v) => !v)} />
        <Row icon="✓✓" label="Read Receipts" value={receipts ? "On" : "Off"} onClick={() => setReceipts((v) => !v)} />
        <Row icon="🛡️" label="Security Center" onClick={() => setSecurityOpen(true)} />
        <Row icon="🚫" label="Blocked Contacts" value={blockList.length} onClick={() => setBlockedOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Appearance</div>
        <Row icon="🌙" label="Dark Mode" value={theme === "dark" ? "On" : "Off"} onClick={toggleTheme} />
        <Row icon="🎨" label="Theme &amp; Colors" onClick={() => setThemeOpen(true)} />
        <Row icon="🔤" label="Font Size" value={FONT_SIZES.find((f) => f.id === fontSize)?.label} onClick={() => setFontOpen(true)} />
        <Row icon="🌐" label="Language" onClick={() => setLangOpen(true)} />

        <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Chats &amp; Data</div>
        <Row icon="⭐" label="Starred Messages" value={starred.length} onClick={() => setStarredOpen(true)} />
        <Row icon="📊" label="Analytics" onClick={() => setAnalyticsOpen(true)} />
        <Row icon="🏆" label="Achievements" value={`${unlockedAchievements.length}/9`} onClick={() => setAchOpen(true)} />
        <Row icon="💾" label="Backup, Export & Restore" onClick={() => setDataOpen(true)} />

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

      <Modal open={fontOpen} onClose={() => setFontOpen(false)} title="Font Size">
        <div className="flex flex-col gap-2">
          {FONT_SIZES.map((f) => (
            <div key={f.id} onClick={() => { setFontSize(f.id); setFontOpen(false); }} className={`p-3.5 rounded-xl cursor-pointer ${fontSize === f.id ? "bg-primaryLight text-primary font-semibold" : "bg-app2 text-app"}`} style={{ fontSize: `${f.scale / 100 * 15}px` }}>
              {f.label}
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

      <BlockedContactsModal open={blockedOpen} onClose={() => setBlockedOpen(false)} />

      <Modal open={pinOpen} onClose={() => setPinOpen(false)} title="🔐 App Lock">
        {pin ? (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-app2">App Lock is currently ON.</div>
            <button onClick={removePin} className="py-3 bg-app2 text-red-500 rounded-xl font-semibold">Remove App Lock</button>
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
            <button onClick={savePin} className="py-3 bg-primary text-white rounded-xl font-semibold">Enable App Lock</button>
          </div>
        )}
      </Modal>

      <Modal open={securityOpen} onClose={() => setSecurityOpen(false)} title="🛡️ Security Center">
        <div className="flex items-center gap-3.5 py-3.5 border-b border-app">
          <div className="w-11 h-11 rounded-xl bg-app2 flex items-center justify-center text-lg">🛡️</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-app">Two-Factor Auth</div>
            <div className="text-xs text-app3 mt-0.5">Extra security with backup codes</div>
          </div>
          <Toggle on={twoFAEnabled} onClick={() => (twoFAEnabled ? disable2FA() : enable2FA())} />
        </div>
        <div className="flex items-center gap-3.5 py-3.5 border-b border-app">
          <div className="w-11 h-11 rounded-xl bg-app2 flex items-center justify-center text-lg">📷</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-app">Screenshot-Proof Alerts</div>
            <div className="text-xs text-app3 mt-0.5">Get notified on screenshots</div>
          </div>
          <Toggle on={screenshotProof} onClick={() => setScreenshotProof((v) => !v)} />
        </div>
        <div className="flex items-center gap-3.5 py-3.5">
          <div className="w-11 h-11 rounded-xl bg-app2 flex items-center justify-center text-lg">🕵️</div>
          <div className="flex-1">
            <div className="text-sm font-medium text-app">Incognito Keyboard</div>
            <div className="text-xs text-app3 mt-0.5">Hint to disable keyboard learning</div>
          </div>
          <Toggle on={incognitoKeyboard} onClick={() => setIncognitoKeyboard((v) => !v)} />
        </div>
        {twoFAEnabled && backupCodes.length > 0 && (
          <div className="mt-3 p-3 bg-app2 rounded-xl">
            <div className="text-xs text-app2 mb-1.5">Backup codes:</div>
            <div className="font-mono text-xs text-app leading-relaxed">{backupCodes.join("  ")}</div>
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

      <ThemeBuilderModal open={themeOpen} onClose={() => setThemeOpen(false)} />
      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
      <DataModal open={dataOpen} onClose={() => setDataOpen(false)} />
      <QRCodeModal open={qrOpen} onClose={() => setQrOpen(false)} profile={profile} />
      <AchievementsModal open={achOpen} onClose={() => setAchOpen(false)} />
      <AnalyticsModal open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <BusinessModal open={businessOpen} onClose={() => setBusinessOpen(false)} currentChat={null} onShareToChat={() => {}} />
      <AISettingsModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
