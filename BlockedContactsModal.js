"use client";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";

export default function BlockedContactsModal({ open, onClose }) {
  const { blockList, unblockContact } = useApp();
  return (
    <Modal open={open} onClose={onClose} title="🚫 Blocked Contacts">
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
  );
}
