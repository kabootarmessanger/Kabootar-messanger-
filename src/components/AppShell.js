"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { listenForIncomingCalls, listenForIncomingGroupCalls, updateCallDoc } from "@/lib/realCall";
import { setOnlineStatus } from "@/lib/realChat";
import { subscribeToPush } from "@/lib/push";
import { ACCENT_COLORS, FONT_SIZES } from "@/data/seed";
import TabBar from "./TabBar";
import Toast from "./Toast";
import Confetti from "./Confetti";
import ScreenshotAlert from "./ScreenshotAlert";
import Onboarding from "./Onboarding";
import ChatsScreen from "./ChatsScreen";
import ContactsScreen from "./ContactsScreen";
import StatusScreen from "./StatusScreen";
import CallsScreen from "./CallsScreen";
import SettingsScreen from "./SettingsScreen";
import ChatRoom from "./ChatRoom";
import ContactInfo from "./ContactInfo";
import GroupInfo from "./GroupInfo";
import CallScreen from "./CallScreen";
import RealCallScreen from "./RealCallScreen";
import RealGroupCallScreen from "./RealGroupCallScreen";
import PinLock from "./PinLock";

// A "ringing" call doc left over from a call nobody answered (or that
// already finished) should stop showing up as incoming after a while.
const INCOMING_CALL_MAX_AGE_MS = 2 * 60 * 1000;
function isFresh(call) {
  const ms = call?.createdAt?.toMillis ? call.createdAt.toMillis() : null;
  return ms == null || Date.now() - ms < INCOMING_CALL_MAX_AGE_MS;
}

export default function AppShell() {
  const { theme, pin, accent, customTheme, fontSize, chats, chatPins, onboarded, setOnboarded, logCall, confettiEmoji } = useApp();
  const { user } = useAuth();
  const [tab, setTab] = useState("chats");
  const [openChat, setOpenChat] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pendingLockChat, setPendingLockChat] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [incomingGroupCall, setIncomingGroupCall] = useState(null);
  const [activeRealCall, setActiveRealCall] = useState(null);
  const [activeGroupCall, setActiveGroupCall] = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub1 = listenForIncomingCalls(user.uid, (c) => setIncomingCall(isFresh(c) ? c : null));
    const unsub2 = listenForIncomingGroupCalls(user.uid, (c) => setIncomingGroupCall(isFresh(c) ? c : null));
    return () => { unsub1(); unsub2(); };
  }, [user]);

  // Approximate online/last-seen presence: heartbeat while the app is open
  // and visible, mark offline on the way out. Firestore has no real
  // "disconnected" event, so a reader treats a stale heartbeat as offline.
  useEffect(() => {
    if (!user) return;
    setOnlineStatus(user.uid, true);
    subscribeToPush(user.uid);
    const heartbeat = setInterval(() => {
      if (document.visibilityState === "visible") setOnlineStatus(user.uid, true);
    }, 25000);
    const onVisibility = () => setOnlineStatus(user.uid, document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    const onUnload = () => setOnlineStatus(user.uid, false);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
      setOnlineStatus(user.uid, false);
    };
  }, [user]);

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
      {tab === "contacts" && <ContactsScreen onOpenChat={handleOpenChat} onAvatarClick={() => setTab("profile")} />}
      {tab === "chats" && <ChatsScreen onOpenChat={handleOpenChat} onAvatarClick={() => setTab("profile")} />}
      {tab === "status" && <StatusScreen onAvatarClick={() => setTab("profile")} />}
      {tab === "calls" && <CallsScreen onStartCall={handleStartCall} onAvatarClick={() => setTab("profile")} />}
      {tab === "profile" && <SettingsScreen onOpenChat={handleOpenChat} />}

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

      {incomingCall && !activeRealCall && (
        <div className="absolute inset-x-0 top-0 z-[650] pt-[max(0.75rem,env(safe-area-inset-top))] px-3">
          <div className="bg-app shadow-xl rounded-2xl p-4 flex items-center gap-3 border border-app">
            <div className="text-3xl">{incomingCall.type === "video" ? "📹" : "📞"}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-app truncate">{incomingCall.callerName}</div>
              <div className="text-xs text-app3">Incoming {incomingCall.type} call…</div>
            </div>
            <button
              onClick={() => { updateCallDoc(incomingCall.id, { status: "declined" }); setIncomingCall(null); }}
              className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center text-lg"
            >
              ✕
            </button>
            <button
              onClick={() => {
                setActiveRealCall({
                  role: "callee",
                  callId: incomingCall.id,
                  otherUser: { uid: incomingCall.callerId, name: incomingCall.callerName },
                  type: incomingCall.type,
                  existingOffer: incomingCall.offer
                });
                setIncomingCall(null);
              }}
              className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center text-lg"
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {incomingGroupCall && !activeGroupCall && (
        <div className="absolute inset-x-0 top-0 z-[650] pt-[max(0.75rem,env(safe-area-inset-top))] px-3">
          <div className="bg-app shadow-xl rounded-2xl p-4 flex items-center gap-3 border border-app">
            <div className="text-3xl">👥</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-app truncate">{incomingGroupCall.name}</div>
              <div className="text-xs text-app3">Incoming group {incomingGroupCall.type} call…</div>
            </div>
            <button
              onClick={() => setIncomingGroupCall(null)}
              className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center text-lg"
            >
              ✕
            </button>
            <button
              onClick={() => {
                setActiveGroupCall({ callId: incomingGroupCall.id, isStarter: false });
                setIncomingGroupCall(null);
              }}
              className="w-11 h-11 rounded-full bg-green-500 text-white flex items-center justify-center text-lg"
            >
              ✓
            </button>
          </div>
        </div>
      )}

      {activeRealCall && (
        <RealCallScreen
          {...activeRealCall}
          myUid={user?.uid}
          myName={user?.displayName || "Kabootar user"}
          onEnd={() => setActiveRealCall(null)}
        />
      )}

      {activeGroupCall && (
        <RealGroupCallScreen
          {...activeGroupCall}
          myUid={user?.uid}
          myName={user?.displayName || "Kabootar user"}
          onEnd={() => setActiveGroupCall(null)}
        />
      )}

      {locked && pin && <PinLock pin={pin} onUnlock={() => setLocked(false)} />}
      {!onboarded && <Onboarding open onDone={() => setOnboarded(true)} />}

      <ScreenshotAlert />
      <Confetti emoji={confettiEmoji} />
      <Toast />
    </div>
  );
}
