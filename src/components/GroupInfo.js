"use client";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";
import Modal from "./Modal";

export default function GroupInfo({ chatName, onClose, onLeft }) {
  const { chats, contacts, addGroupMembers, removeGroupMember, renameGroup, deleteChat, showToast, profile } = useApp();
  const chat = chats.find((c) => c.name === chatName);
  const [addOpen, setAddOpen] = useState(false);
  const [picked, setPicked] = useState([]);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(chatName);

  if (!chat) return null;
  const members = chat.members || [];
  const admins = chat.admins || [];
  const available = contacts.filter((c) => c.reg && !members.includes(c.name));

  const togglePick = (name) => setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  const confirmAdd = () => {
    if (!picked.length) return;
    addGroupMembers(chatName, picked);
    showToast(`Added ${picked.length} member(s)`);
    setPicked([]);
    setAddOpen(false);
  };

  const confirmRename = () => {
    if (!newName.trim() || newName === chatName) {
      setRenaming(false);
      return;
    }
    renameGroup(chatName, newName.trim());
    setRenaming(false);
    onClose();
  };

  const leave = () => {
    if (!window.confirm("Leave this group?")) return;
    deleteChat(chatName);
    onLeft();
  };

  return (
    <div className="fixed inset-0 max-w-app mx-auto bg-app z-[260] flex flex-col overflow-y-auto">
      <div className="bg-primary text-white px-2 py-2 flex items-center gap-1">
        <div onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl cursor-pointer">←</div>
        <div className="flex-1 text-lg font-medium pl-1">Group Info</div>
      </div>
      <div className="py-6 px-4 text-center">
        <div className="mx-auto mb-3 w-fit">
          <Avatar src={chat.avatar} name={chatName} size={100} />
        </div>
        <h2 className="text-2xl font-medium text-app mb-1.5">{chatName}</h2>
        <div className="text-sm text-app2">{members.length} members</div>
      </div>

      <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">Members</div>
      {members.map((m) => {
        const c = contacts.find((x) => x.name === m);
        const isAdmin = admins.includes(m);
        return (
          <div key={m} className="flex items-center gap-3 px-4 py-3 border-b border-app">
            <Avatar src={c?.avatar} name={m} size={40} />
            <div className="flex-1">
              <div className="text-sm font-medium text-app">{m}{m === profile.name ? " (You)" : ""}</div>
              <div className="text-xs text-app3 mt-0.5">{isAdmin ? "Admin" : "Member"}</div>
            </div>
            {isAdmin && <div className="text-[10px] bg-primaryLight text-primary px-2 py-0.5 rounded-full font-bold">ADMIN</div>}
            {!isAdmin && m !== profile.name && (
              <button onClick={() => removeGroupMember(chatName, m)} className="text-xs text-red-500 font-semibold px-2">
                Remove
              </button>
            )}
          </div>
        );
      })}

      <div className="px-4 pt-4 pb-2 text-xs font-semibold text-primary">Actions</div>
      <div onClick={() => setAddOpen(true)} className="flex items-center px-4 py-4 border-b border-app cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">➕</div>
        <div className="flex-1 text-base text-app">Add Members</div>
      </div>
      <div onClick={() => setRenaming(true)} className="flex items-center px-4 py-4 border-b border-app cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">✏️</div>
        <div className="flex-1 text-base text-app">Edit Group Name</div>
      </div>
      <div onClick={leave} className="flex items-center px-4 py-4 border-b border-app cursor-pointer text-red-500">
        <div className="w-10 h-10 rounded-full bg-app2 flex items-center justify-center text-lg mr-4">🚪</div>
        <div className="flex-1 text-base">Leave Group</div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Members">
        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-3">
          {available.length === 0 && <div className="text-sm text-app3">No more contacts to add</div>}
          {available.map((c) => (
            <label key={c.name} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer ${picked.includes(c.name) ? "bg-primaryLight" : "bg-app2"}`}>
              <input type="checkbox" checked={picked.includes(c.name)} onChange={() => togglePick(c.name)} className="w-5 h-5 accent-primary" />
              <Avatar src={c.avatar} name={c.name} size={40} />
              <div className="text-sm font-medium text-app">{c.name}</div>
            </label>
          ))}
        </div>
        <button onClick={confirmAdd} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">Add Selected</button>
      </Modal>

      <Modal open={renaming} onClose={() => setRenaming(false)} title="Edit Group Name">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full p-3 bg-app2 rounded-xl outline-none text-app mb-3" />
        <button onClick={confirmRename} className="w-full py-3 bg-primary text-white rounded-xl font-semibold">Save</button>
      </Modal>
    </div>
  );
}
