"use client";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  findUserByIdentifier, findUsersByPhones, getOrCreateChat, getUserProfile,
  listenToMyChats, createGroupChat
} from "@/lib/realChat";
import Avatar from "./Avatar";
import Modal from "./Modal";
import RealChatRoom from "./RealChatRoom";

export default function ContactsScreen({ onOpenChat, onAvatarClick }) {
  const { contacts, favoriteContacts, toggleFavoriteContact, showToast, chats, profile } = useApp();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [findOpen, setFindOpen] = useState(false);
  const [findValue, setFindValue] = useState("");
  const [findBusy, setFindBusy] = useState(false);
  const [findError, setFindError] = useState("");
  const [realChats, setRealChats] = useState([]);
  const [activeReal, setActiveReal] = useState(null); // full chats/{id} doc
  const [myProfile, setMyProfile] = useState(null);
  const [syncSupported, setSyncSupported] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(null); // { matched: [...], total: n } | null

  const [groupOpen, setGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupPicked, setGroupPicked] = useState([]); // array of user docs
  const [groupPhoneInput, setGroupPhoneInput] = useState("");
  const [groupBusy, setGroupBusy] = useState(false);
  const [groupError, setGroupError] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = listenToMyChats(user.uid, setRealChats);
    getUserProfile(user.uid).then(setMyProfile);
    return unsub;
  }, [user]);

  useEffect(() => {
    setSyncSupported(typeof navigator !== "undefined" && "contacts" in navigator && "ContactsManager" in window);
  }, []);

  const filtered = useMemo(
    () => contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query]
  );

  const favContactObjs = useMemo(
    () => favoriteContacts.map((name) => contacts.find((c) => c.name === name)).filter(Boolean),
    [favoriteContacts, contacts]
  );

  const mutualGroupCount = (contactName) =>
    chats.filter((c) => c.isGroup && c.members?.includes(contactName) && c.members?.includes(profile.name)).length;

  const handleInvite = async () => {
    const link = "https://kabootarmessanger.github.io/Kabootar-messanger-/";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Kabootar", text: "Chalo Kabootar pe chat karte hain!", url: link });
      } catch {}
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(link);
      showToast("Invite link copied");
    }
  };

  // People from your existing 1:1 real chats — the easiest pool to build a
  // group from, so you don't have to re-search everyone by phone again.
  const knownRealPeople = useMemo(() => {
    const seen = new Map();
    realChats.forEach((c) => {
      if (c.isGroup) return;
      const otherUid = c.participants.find((p) => p !== user?.uid);
      const info = c.participantInfo?.[otherUid];
      if (otherUid && info && !seen.has(otherUid)) seen.set(otherUid, { uid: otherUid, ...info });
    });
    return [...seen.values()];
  }, [realChats, user]);

  const me = () => ({
    uid: user.uid,
    email: user.email,
    name: myProfile?.name || user.displayName,
    phoneNumber: myProfile?.phoneNumber
  });

  const handleSyncContacts = async () => {
    if (!syncSupported) {
      alert(
        "Phone contacts sync sirf Chrome for Android pe kaam karta hai — Safari/iPhone aur desktop browsers privacy ki wajah se web apps ko contacts access nahi dene dete."
      );
      return;
    }
    setSyncing(true);
    try {
      const picked = await navigator.contacts.select(["name", "tel"], { multiple: true });
      const numbers = picked.flatMap((p) => p.tel || []);
      const matches = await findUsersByPhones(numbers);
      const filteredMatches = matches.filter((m) => m.uid !== user.uid);
      setSynced({ matched: filteredMatches, total: numbers.length });
    } catch (err) {
      // User cancelled the picker, or permission was blocked — not an error worth surfacing.
    } finally {
      setSyncing(false);
    }
  };

  const openMatchedContact = async (other) => {
    const chatId = await getOrCreateChat(me(), other);
    setActiveReal({
      id: chatId,
      isGroup: false,
      participants: [user.uid, other.uid],
      participantInfo: { [user.uid]: me(), [other.uid]: other }
    });
  };

  const handleFind = async (e) => {
    e.preventDefault();
    setFindError("");
    setFindBusy(true);
    try {
      const value = findValue.trim();
      const isOwnPhone = myProfile?.phoneNumber && value === myProfile.phoneNumber;
      const isOwnEmail = value.toLowerCase() === (user.email || "").toLowerCase();
      if (isOwnPhone || isOwnEmail) {
        setFindError("Yeh toh aapki hi identity hai 🙂");
        return;
      }
      const other = await findUserByIdentifier(value);
      if (!other) {
        setFindError("Is number/email se koi Kabootar account nahi mila");
        return;
      }
      await openMatchedContact(other);
      setFindOpen(false);
      setFindValue("");
    } catch (err) {
      setFindError("Kuch galat ho gaya, dobara try karo");
    } finally {
      setFindBusy(false);
    }
  };

  const openRealChat = (chat) => setActiveReal(chat);

  // --- Group creation ---
  const toggleGroupPick = (person) => {
    setGroupPicked((p) => (p.some((x) => x.uid === person.uid) ? p.filter((x) => x.uid !== person.uid) : [...p, person]));
  };
  const addGroupMemberByPhone = async () => {
    setGroupError("");
    const value = groupPhoneInput.trim();
    if (!value) return;
    const found = await findUserByIdentifier(value);
    if (!found) {
      setGroupError("Ye number Kabootar pe nahi mila");
      return;
    }
    if (found.uid === user.uid) {
      setGroupError("Yeh aapki hi identity hai");
      return;
    }
    toggleGroupPick(found);
    setGroupPhoneInput("");
  };
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupError("");
    if (!groupName.trim()) { setGroupError("Group ka naam daalo"); return; }
    if (groupPicked.length < 2) { setGroupError("Kam se kam 2 members chuno (group ke liye 3+ log chahiye)"); return; }
    setGroupBusy(true);
    try {
      const chat = await createGroupChat(groupName, groupPicked, me());
      setGroupOpen(false);
      setGroupName("");
      setGroupPicked([]);
      setActiveReal(chat);
    } catch {
      setGroupError("Group nahi ban paaya, dobara try karo");
    } finally {
      setGroupBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-primary px-3 pb-2.5 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center gap-2">
        <div className="bg-white/15 rounded-full px-3.5 py-2 flex items-center gap-2.5 flex-1">
          <span className="text-white">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts"
            className="flex-1 bg-transparent outline-none text-white placeholder-white/70 text-sm"
          />
        </div>
        <button
          onClick={() => setGroupOpen(true)}
          className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center text-xl shrink-0"
          title="Create a real group"
        >
          👥
        </button>
        <button
          onClick={handleSyncContacts}
          disabled={syncing}
          className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center text-xl shrink-0 disabled:opacity-60"
          title="Sync your phone contacts"
        >
          {syncing ? "⏳" : "📱"}
        </button>
        <button
          onClick={() => setFindOpen(true)}
          className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center text-xl shrink-0"
          title="Find a real Kabootar user by phone number"
        >
          🌐
        </button>
        <button onClick={onAvatarClick} className="shrink-0"><Avatar src={myProfile?.avatar} name={myProfile?.name || user?.displayName} size={36} /></button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="m-3.5 p-4 bg-primaryLight rounded-2xl flex items-center gap-3">
          <span className="text-2xl shrink-0">👥</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-app">Invite Friends to Kabootar</div>
            <div className="text-xs text-app3">Apna link share karo</div>
          </div>
          <button onClick={handleInvite} className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-full shrink-0">
            Invite
          </button>
        </div>

        {favContactObjs.length > 0 && (
          <>
            <div className="px-4 pt-1 pb-2 text-xs font-semibold text-primary">⭐ FAVORITES</div>
            <div className="flex gap-4 px-4 pb-4 overflow-x-auto">
              {favContactObjs.map((c) => (
                <div key={c.name} onClick={() => c.reg && onOpenChat(c.name)} className="flex flex-col items-center gap-1 shrink-0 w-16 cursor-pointer">
                  <Avatar src={c.avatar} name={c.name} size={56} />
                  <span className="text-[11px] text-app2 truncate w-full text-center">{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {synced && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">
              📱 From Your Phone {synced.matched.length > 0 && `(${synced.matched.length} on Kabootar)`}
            </div>
            {synced.matched.length === 0 ? (
              <div className="px-4 pb-3 text-xs text-app3">
                {synced.total} contacts check kiye — inme se koi Kabootar pe nahi mila abhi.
              </div>
            ) : (
              synced.matched.map((m) => (
                <div key={m.uid} onClick={() => openMatchedContact(m)} className="flex items-center gap-3.5 px-4 py-3 border-b border-app cursor-pointer">
                  <Avatar name={m.name} size={48} />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-app">{m.name}</div>
                    <div className="text-xs text-app3 mt-0.5">{m.phoneNumber}</div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {realChats.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">Real Kabootar Chats</div>
            {realChats.map((c) => {
              let title, sub;
              if (c.isGroup) {
                title = c.name;
                sub = c.lastMessage || `${c.participants.length} members`;
              } else {
                const otherUid = c.participants.find((p) => p !== user.uid);
                const other = c.participantInfo?.[otherUid] || { name: "Kabootar user" };
                title = other.name;
                sub = c.lastMessage || "Say hi 👋";
              }
              return (
                <div key={c.id} onClick={() => openRealChat(c)} className="flex items-center gap-3.5 px-4 py-3 border-b border-app cursor-pointer">
                  <Avatar name={title} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-app flex items-center gap-1">
                      {c.isGroup && <span>👥</span>} {title}
                    </div>
                    <div className="text-xs text-app3 mt-0.5 truncate">{sub}</div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">Demo Contacts</div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 px-8 text-app3">
            <div className="text-6xl mb-4 opacity-40">📇</div>
            <h3 className="text-lg font-medium text-app2 mb-1.5">No contacts</h3>
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.name}
              onClick={() => c.reg && onOpenChat(c.name)}
              className={`flex items-center gap-3.5 px-4 py-3 border-b border-app ${c.reg ? "cursor-pointer" : "opacity-60"}`}
            >
              <Avatar src={c.avatar} name={c.name} size={48} />
              <div className="flex-1">
                <div className="font-medium text-sm text-app">{c.name}</div>
                <div className="text-xs text-app3 mt-0.5">{c.sub}</div>
                {c.reg && mutualGroupCount(c.name) > 0 && (
                  <div className="text-[11px] text-app3 mt-0.5">{mutualGroupCount(c.name)} mutual group{mutualGroupCount(c.name) > 1 ? "s" : ""}</div>
                )}
              </div>
              {c.reg && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavoriteContact(c.name); }}
                  className={`text-lg px-1.5 ${favoriteContacts.includes(c.name) ? "text-amber-400" : "text-app3"}`}
                >
                  {favoriteContacts.includes(c.name) ? "★" : "☆"}
                </button>
              )}
              {!c.reg && <div className="text-[11px] text-app3">Invite</div>}
            </div>
          ))
        )}
      </div>

      <Modal open={findOpen} onClose={() => { setFindOpen(false); setFindError(""); }} title="🌐 Find a real Kabootar user">
        <form onSubmit={handleFind} className="flex flex-col gap-3">
          <p className="text-xs text-app3 -mt-1">Unka mobile number daalo (jis se woh signup kiya tha) — dono ko real-time messages milenge.</p>
          <input
            type="text"
            required
            value={findValue}
            onChange={(e) => setFindValue(e.target.value)}
            placeholder="+91 98765 43210"
            className="p-3 bg-app2 rounded-xl outline-none text-app"
          />
          {findError && <div className="text-xs text-red-500">{findError}</div>}
          <button type="submit" disabled={findBusy} className="py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-60">
            {findBusy ? "Dhoondh rahe hain…" : "Chat shuru karo"}
          </button>
        </form>
      </Modal>

      <Modal open={groupOpen} onClose={() => { setGroupOpen(false); setGroupError(""); }} title="👥 Naya real group">
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-3">
          <input
            type="text"
            required
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group ka naam"
            className="p-3 bg-app2 rounded-xl outline-none text-app"
          />

          {knownRealPeople.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-primary mb-1.5">Apni real chats se chuno</div>
              <div className="max-h-40 overflow-y-auto flex flex-col gap-1">
                {knownRealPeople.map((p) => {
                  const picked = groupPicked.some((x) => x.uid === p.uid);
                  return (
                    <div
                      key={p.uid}
                      onClick={() => toggleGroupPick(p)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer ${picked ? "bg-primary/10" : ""}`}
                    >
                      <Avatar name={p.name} size={32} />
                      <div className="flex-1 text-sm text-app">{p.name}</div>
                      {picked && <span className="text-primary">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-primary mb-1.5">Ya phone number se add karo</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={groupPhoneInput}
                onChange={(e) => setGroupPhoneInput(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 p-3 bg-app2 rounded-xl outline-none text-app text-sm"
              />
              <button type="button" onClick={addGroupMemberByPhone} className="px-4 bg-app2 rounded-xl text-sm font-semibold text-app">
                Add
              </button>
            </div>
          </div>

          {groupPicked.length > 0 && (
            <div className="text-xs text-app3">Members: {groupPicked.map((p) => p.name).join(", ")}</div>
          )}

          {groupError && <div className="text-xs text-red-500">{groupError}</div>}

          <button type="submit" disabled={groupBusy} className="py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-60">
            {groupBusy ? "Ban raha hai…" : "Group banao"}
          </button>
        </form>
      </Modal>

      {activeReal && (
        <RealChatRoom chat={activeReal} onClose={() => setActiveReal(null)} />
      )}
    </div>
  );
}
