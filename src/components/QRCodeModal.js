"use client";
import Modal from "./Modal";
import { makeQRSvg } from "@/lib/qrcode";

export default function QRCodeModal({ open, onClose, profile }) {
  if (!open) return null;
  const svg = makeQRSvg(`kabootar://u/${profile.handle}`, 200);
  return (
    <Modal open={open} onClose={onClose} title="Your QR Code">
      <div className="text-center py-2">
        <div className="mx-auto w-fit" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-4 font-semibold text-base text-app">{profile.name}</p>
        <p className="text-primary text-sm">{profile.handle}</p>
        <p className="text-xs text-app3 mt-3">Others can scan this to start a chat with you.</p>
      </div>
    </Modal>
  );
}
