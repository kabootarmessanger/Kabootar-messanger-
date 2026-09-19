"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ACCENT_COLORS, FONT_SIZES } from "@/data/seed";
import TabBar from "./TabBar";
import Toast from "./Toast";
import Confetti from "./Confetti";
import ScreenshotAlert from "./ScreenshotAlert";
import Onboarding from "./Onboarding";
import ChatsScreen from "./ChatsScreen";
import StatusScreen from "./StatusScreen";
import CallsScreen from "./CallsScreen";
import SettingsScreen from "./SettingsScreen";
import ChatRoom from "./ChatRoom";
import ContactInfo from "./ContactInfo";
import GroupInfo from "./GroupInfo";
import CallScreen from "./CallScreen";
import PinLock from "./PinLock";

export default function AppShell() {
  const { theme, pin, accent, customTheme, fontSize, chats, chatPins, onboarded, setOnboarded, logCall, confettiEmoji } = useApp();
  const [tab, setTab] = useState("chats");
  const [openChat, setOpenChat] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pendingLockChat, setPendingLockChat] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  useEffect(() => {
    if (pin) setLocked(true);
  }, [pin]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const hex = accent === "custom" ? customTheme.primary : (ACCENT_COLORS.find((c) => c.id === accent)?.hex || "#C85A32");
    document.documentElement.style.setProperty("--p", hex);
    if (accent === "custom") {
      document.documentElement.style.setProperty("--out", customTheme.out);
      document.documentElement.style.setProperty("--in", customTheme.in);
    }
  }, [accent, customTheme]);

  useEffect(() => {
    const scale = FONT_SIZES.find((f) => f.id === fontSize)?.scale || 100;
    document.documentElement.style.fontSize = scale + "%";
  }, [fontSize]);

  const handleOpenChat = (name) => {
    if (chatPins[name]) {
      setPendingLockChat(name);
    } else {
      setOpenChat(name);
    }
  };

  const handleStartCall = (name, type, isGroup, members) => {
    const chat = chats.find((c) => c.name === name);
    setActiveCall({
      name,
      type,
      avatar: chat?.avatar,
      isGroup: isGroup ?? chat?.isGroup,
      members: members || chat?.members
    });
  };

  const handleEndCall = () => {
    if (activeCall) {
      logCall({
        name: activeCall.name,
        avatar: activeCall.avatar,
        type: activeCall.type,
        status: "outgoing",
        time: "Just now",
        duration: "0:00",
        isGroup: activeCall.isGroup,
        members: activeCall.members
      });
    }
    setActiveCall(null);
  };

  return (
    <div className="w-full h-dvh max-w-app mx-auto bg-app relative overflow-hidden flex flex-col">
      {tab === "chats" && <ChatsScreen onOpenChat={handleOpenChat} />}
      {tab === "status" && <StatusScreen />}
      {tab === "calls" && <CallsScreen onStartCall={handleStartCall} />}
      {tab === "settings" && <SettingsScreen />}

      <TabBar active={tab} onChange={setTab} />

      {openChat && (
        <ChatRoom
          chatName={openChat}
          onClose={() => setOpenChat(null)}
          onOpenInfo={() => setInfoOpen(true)}
          onStartCall={handleStartCall}
        />
      )}
      {infoOpen && openChat && (
        <ContactInfo
          chatName={openChat}
          onClose={() => setInfoOpen(false)}
          onOpenGroupInfo={() => {
            setInfoOpen(false);
            setGroupInfoOpen(true);
          }}
        />
      )}
      {groupInfoOpen && openChat && (
        <GroupInfo
          chatName={openChat}
          onClose={() => setGroupInfoOpen(false)}
          onLeft={() => {
            setGroupInfoOpen(false);
            setOpenChat(null);
          }}
        />
      )}

      {pendingLockChat && (
        <PinLock
          pin={chatPins[pendingLockChat]}
          title={pendingLockChat}
          hint="Enter PIN to unlock this chat"
          onCancel={() => setPendingLockChat(null)}
          onUnlock={() => {
            setOpenChat(pendingLockChat);
            setPendingLockChat(null);
          }}
        />
      )}

      <CallScreen call={activeCall} onEnd={handleEndCall} />

      {locked && pin && <PinLock pin={pin} onUnlock={() => setLocked(false)} />}
      {!onboarded && <Onboarding open onDone={() => setOnboarded(true)} />}

      <ScreenshotAlert />
      <Confetti emoji={confettiEmoji} />
      <Toast />
    </div>
  );
}
