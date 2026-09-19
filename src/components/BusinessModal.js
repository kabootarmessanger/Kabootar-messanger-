"use client";
import { useState } from "react";
import Modal from "./Modal";
import { useApp } from "@/context/AppContext";

export default function BusinessModal({ open, onClose, onShareToChat, currentChat }) {
  const { catalog, addProduct, deleteProduct, orders, addOrder, upiId, setUpiId, showToast } = useApp();
  const [tab, setTab] = useState("catalog");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (!open) return null;

  const create = () => {
    if (!name.trim() || !price) return showToast("Enter name and price");
    addProduct({ name: name.trim(), price: Number(price), stock: Number(stock) || 0, img: `https://picsum.photos/seed/${Date.now()}/300/300` });
    setName(""); setPrice(""); setStock("");
    showToast("Product added");
  };

  const shareProduct = (p) => {
    if (!currentChat) return showToast("Open a chat first");
    onShareToChat({ text: `🛒 ${p.name} — ₹${p.price}`, product: p });
    onClose();
  };

  const sendPaymentReq = () => {
    if (!amount) return showToast("Enter amount");
    if (!currentChat) return showToast("Open a chat first");
    onShareToChat({ text: `💳 Payment request ₹${amount}${note ? " — " + note : ""}`, upi: { amount: Number(amount), note, upiId } });
    addOrder({ customer: currentChat, total: Number(amount), items: [] });
    setAmount(""); setNote("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="💼 Business">
      <div className="flex gap-2 mb-4">
        {["catalog", "orders", "payment"].map((tKey) => (
          <button
            key={tKey}
            onClick={() => setTab(tKey)}
            className={`flex-1 py-2 rounded-full text-xs font-semibold capitalize ${tab === tKey ? "bg-primary text-white" : "bg-app2 text-app2"}`}
          >
            {tKey}
          </button>
        ))}
      </div>

      {tab === "catalog" && (
        <div>
          <div className="grid grid-cols-2 gap-2.5 mb-4 max-h-[260px] overflow-y-auto">
            {catalog.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={p.id} className="bg-app2 rounded-xl overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-24 object-cover" />
                <div className="p-2.5">
                  <div className="text-xs font-semibold text-app truncate">{p.name}</div>
                  <div className="text-sm font-bold text-primary mt-0.5">₹{p.price}</div>
                  <div className="text-[10px] text-app3">{p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}</div>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => shareProduct(p)} className="flex-1 text-[11px] bg-primary text-white rounded-lg py-1.5 font-semibold">Send</button>
                    <button onClick={() => deleteProduct(p.id)} className="text-[11px] bg-app rounded-lg py-1.5 px-2 text-red-500 font-semibold">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 bg-app2 p-3 rounded-xl">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="p-2.5 bg-app rounded-lg outline-none text-sm text-app" />
            <div className="flex gap-2">
              <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ₹" type="number" className="flex-1 p-2.5 bg-app rounded-lg outline-none text-sm text-app" />
              <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" type="number" className="flex-1 p-2.5 bg-app rounded-lg outline-none text-sm text-app" />
            </div>
            <button onClick={create} className="py-2.5 bg-primary text-white rounded-lg font-semibold text-sm">➕ Add Product</button>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-sm text-app3 text-center py-6">No orders yet</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="bg-app2 p-3 rounded-xl">
                <div className="text-[11px] text-app3 font-semibold">{o.id}</div>
                <div className="text-sm font-medium text-app mt-0.5">{o.customer}</div>
                <div className="text-base font-bold text-primary mt-0.5">₹{o.total}</div>
                <div className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  o.status === "delivered" ? "bg-emerald-100 text-emerald-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {o.status.toUpperCase()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "payment" && (
        <div className="flex flex-col gap-3">
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="Your UPI ID" className="p-3 bg-app2 rounded-xl outline-none text-sm text-app" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ₹" type="number" className="p-3 bg-app2 rounded-xl outline-none text-sm text-app" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="p-3 bg-app2 rounded-xl outline-none text-sm text-app" />
          <button onClick={sendPaymentReq} className="py-3 bg-primary text-white rounded-xl font-semibold">Send Payment Request to Chat</button>
        </div>
      )}
    </Modal>
  );
}
