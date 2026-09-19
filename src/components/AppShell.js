"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import TabBar from "./TabBar";
import Toast from "./Toast";
import ChatsScreen from "./ChatsScreen";
import StatusScreen from "./StatusScreen";
import CallsScreen from "./CallsScreen";
import SettingsScreen from "./SettingsScreen";
import ChatRoom from "./ChatRoom";
import ContactInfo from "./ContactInfo";
import PinLock from "./PinLock";

export default function AppShell() {
  const { theme, pin } = useApp();
  const [tab, setTab] = useState("chats");
  const [openChat, setOpenChat] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (pin) setLocked(true);
  }, [pin]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="w-full h-dvh max-w-app mx-auto bg-app relative overflow-hidden flex flex-col">
      {tab === "chats" && <ChatsScreen onOpenChat={setOpenChat} />}
      {tab === "status" && <StatusScreen />}
      {tab === "calls" && <CallsScreen />}
      {tab === "settings" && <SettingsScreen />}

      <TabBar active={tab} onChange={setTab} />

      {openChat && (
        <ChatRoom
          chatName={openChat}
          onClose={() => setOpenChat(null)}
          onOpenInfo={() => setInfoOpen(true)}
        />
      )}
      {infoOpen && openChat && <ContactInfo chatName={openChat} onClose={() => setInfoOpen(false)} />}

      {locked && pin && <PinLock pin={pin} onUnlock={() => setLocked(false)} />}

      <Toast />
    </div>
  );
}
