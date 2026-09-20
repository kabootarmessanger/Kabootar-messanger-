"use client";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { findUserByEmail, getOrCreateChat, listenToMyChats } from "@/lib/realChat";
import Avatar from "./Avatar";
import Modal from "./Modal";
import RealChatRoom from "./RealChatRoom";

export default function ContactsScreen({ onOpenChat }) {
  const { contacts } = useApp();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [findOpen, setFindOpen] = useState(false);
  const [findEmail, setFindEmail] = useState("");
  const [findBusy, setFindBusy] = useState(false);
  const [findError, setFindError] = useState("");
  const [realChats, setRealChats] = useState([]);
  const [activeReal, setActiveReal] = useState(null); // { chatId, otherUser }

  useEffect(() => {
    if (!user) return;
    const unsub = listenToMyChats(user.uid, setRealChats);
    return unsub;
  }, [user]);

  const filtered = useMemo(
    () => contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query]
  );

  const handleFind = async (e) => {
    e.preventDefault();
    setFindError("");
    setFindBusy(true);
    try {
      const email = findEmail.trim().toLowerCase();
      if (email === (user.email || "").toLowerCase()) {
        setFindError("Yeh toh aapki hi email hai 🙂");
        return;
      }
      const other = await findUserByEmail(email);
      if (!other) {
        setFindError("Is email se koi Kabootar account nahi mila");
        return;
      }
      const chatId = await getOrCreateChat({ uid: user.uid, email: user.email, name: user.displayName }, other);
      setFindOpen(false);
      setFindEmail("");
      setActiveReal({ chatId, otherUser: other });
    } catch (err) {
      setFindError("Kuch galat ho gaya, dobara try karo");
    } finally {
      setFindBusy(false);
    }
  };

  const openRealChat = (chat) => {
    const otherUid = chat.participants.find((p) => p !== user.uid);
    const otherUser = chat.participantInfo?.[otherUid] || { name: "Kabootar user" };
    setActiveReal({ chatId: chat.id, otherUser });
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
          onClick={() => setFindOpen(true)}
          className="w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center text-xl shrink-0"
          title="Find a real Kabootar user by email"
        >
          🌐
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {realChats.length > 0 && (
          <>
            <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">Real Kabootar Chats</div>
            {realChats.map((c) => {
              const otherUid = c.participants.find((p) => p !== user.uid);
              const other = c.participantInfo?.[otherUid] || { name: "Kabootar user" };
              return (
                <div key={c.id} onClick={() => openRealChat(c)} className="flex items-center gap-3.5 px-4 py-3 border-b border-app cursor-pointer">
                  <Avatar name={other.name} size={48} />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-app">{other.name}</div>
                    <div className="text-xs text-app3 mt-0.5 truncate">{c.lastMessage || "Say hi 👋"}</div>
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
              </div>
              {!c.reg && <div className="text-[11px] text-app3">Invite</div>}
            </div>
          ))
        )}
      </div>

      <Modal open={findOpen} onClose={() => { setFindOpen(false); setFindError(""); }} title="🌐 Find a real Kabootar user">
        <form onSubmit={handleFind} className="flex flex-col gap-3">
          <p className="text-xs text-app3 -mt-1">Unki signup email daalo — dono ko real-time messages milenge.</p>
          <input
            type="email"
            required
            value={findEmail}
            onChange={(e) => setFindEmail(e.target.value)}
            placeholder="unki@email.com"
            className="p-3 bg-app2 rounded-xl outline-none text-app"
          />
          {findError && <div className="text-xs text-red-500">{findError}</div>}
          <button type="submit" disabled={findBusy} className="py-3 bg-primary text-white rounded-xl font-semibold disabled:opacity-60">
            {findBusy ? "Dhoondh rahe hain…" : "Chat shuru karo"}
          </button>
        </form>
      </Modal>

      {activeReal && (
        <RealChatRoom chatId={activeReal.chatId} otherUser={activeReal.otherUser} onClose={() => setActiveReal(null)} />
      )}
    </div>
  );
}
