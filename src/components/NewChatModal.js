"use client";
import { useState } from "react";
import Modal from "./Modal";
import Avatar from "./Avatar";
import { useApp } from "@/context/AppContext";

export default function NewChatModal({ open, onClose, onOpenChat }) {
  const { contacts, createGroup, showToast } = useApp();
  const [mode, setMode] = useState("list"); // list | group
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState([]);

  const close = () => {
    setMode("list");
    setGroupName("");
    setSelected([]);
    onClose();
  };

  const toggleMember = (name) => {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  };

  const submitGroup = () => {
    if (!groupName.trim()) return showToast("Enter group name");
    if (selected.length < 2) return showToast("Select at least 2 members");
    const g = createGroup(groupName.trim(), selected);
    close();
    onOpenChat(g.name);
  };

  return (
    <Modal open={open} onClose={close} title={mode === "list" ? "New Chat" : "New Group"}>
      {mode === "list" ? (
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {contacts
            .filter((c) => c.reg)
            .map((c) => (
              <div
                key={c.name}
                onClick={() => {
                  close();
                  onOpenChat(c.name);
                }}
                className="flex items-center gap-3 p-2.5 bg-app2 rounded-xl cursor-pointer"
              >
                <Avatar src={c.avatar} name={c.name} size={40} />
                <div>
                  <div className="font-medium text-sm text-app">{c.name}</div>
                  <div className="text-xs text-app3 mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}
          <button
            onClick={() => setMode("group")}
            className="mt-2 py-3.5 bg-primary text-white rounded-xl font-semibold"
          >
            👥 New Group
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            maxLength={30}
            className="p-3.5 bg-app2 rounded-xl text-base outline-none text-app w-full"
          />
          <div>
            <div className="text-xs font-semibold text-app2 mb-2">Select members</div>
            <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5">
              {contacts
                .filter((c) => c.reg)
                .map((c) => (
                  <label
                    key={c.name}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer ${
                      selected.includes(c.name) ? "bg-primaryLight" : "bg-app2"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(c.name)}
                      onChange={() => toggleMember(c.name)}
                      className="w-5 h-5 accent-primary"
                    />
                    <Avatar src={c.avatar} name={c.name} size={40} />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-app">{c.name}</div>
                      <div className="text-xs text-app3">{c.sub}</div>
                    </div>
                  </label>
                ))}
            </div>
          </div>
          <button onClick={submitGroup} className="py-3.5 bg-primary text-white rounded-xl font-semibold">
            Create Group
          </button>
        </div>
      )}
    </Modal>
  );
}
