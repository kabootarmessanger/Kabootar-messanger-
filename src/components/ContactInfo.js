"use client";
import { useApp } from "@/context/AppContext";
import Avatar from "./Avatar";

export default function ContactInfo({ chatName, onClose }) {
  const { chats, contacts, starred, getMessages, clearChat, blockContact, deleteChat, showToast } = useApp();
  const chat = chats.find((c) => c.name === chatName);
  const contact = contacts.find((c) => c.name === chatName);
  if (!chat) return null;

  const mediaCount = getMessages(chatName).filter((m) => m.image || m.video).length;
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
        <div onClick={onClose} className="w-10 h-10 flex items-center justify-center text-xl cursor-pointer">
          ←
        </div>
        <div className="flex-1 text-lg font-medium pl-1">{chat.isGroup ? "Group Info" : "Contact Info"}</div>
      </div>
      <div className="py-8 px-4 text-center">
        <div className="mx-auto mb-4 w-fit">
          <Avatar src={contact?.avatar || chat.avatar} name={chatName} size={100} />
        </div>
        <h2 className="text-2xl font-medium text-app mb-1.5">{chatName}</h2>
        {contact?.sub && <div className="text-sm text-app2">{contact.sub}</div>}
        {chat.isGroup && <div className="text-sm text-app2 mt-1">{chat.members?.length || 0} members</div>}
      </div>

      <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Media & Starred</div>
      <Row icon="🖼️" label="Media, Links, Docs" value={mediaCount} />
      <Row icon="⭐" label="Starred Messages" value={starredCount} />

      <div className="px-4 pt-5 pb-2 text-xs font-semibold text-primary">Chat</div>
      <Row icon="🗑️" label="Clear Chat" onClick={handleClear} />
      <Row icon="🚫" label="Block Contact" danger onClick={handleBlock} />
      <Row icon="❌" label="Delete Chat" danger onClick={handleDelete} />
      <div className="h-10" />
    </div>
  );
}
