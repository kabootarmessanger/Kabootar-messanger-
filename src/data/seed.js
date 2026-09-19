export const INITIAL_CHATS = [
  { id: 1, name: "Priya Patel", avatar: "https://i.pravatar.cc/150?u=priya", last: "Sent the deck, check when free 🙌", time: "5m", unread: 2, pinned: true, status: "read", category: "personal", online: true, muted: false, archived: false, isGroup: false },
  { id: 2, name: "Kabootar Core", avatar: "https://i.pravatar.cc/150?u=core", last: "Poll closed 🚀", time: "30m", unread: 5, pinned: true, status: "delivered", category: "work", online: false, muted: false, archived: false, isGroup: true, members: ["Aarav Sharma", "Priya Patel", "Rohan Gupta"], admins: ["Aarav Sharma"] },
  { id: 3, name: "Aarav Sharma", avatar: "https://i.pravatar.cc/150?u=aarav", last: "🎙️ Voice message", time: "3h", unread: 0, pinned: false, status: "read", category: "personal", online: false, muted: false, archived: false, isGroup: false },
  { id: 4, name: "Design Squad", avatar: "https://i.pravatar.cc/150?u=design", last: "New palette 🧡", time: "6h", unread: 0, pinned: false, status: "read", category: "work", online: false, muted: true, archived: false, isGroup: true, members: ["Aarav Sharma", "Neha Verma", "Kabir Singh"], admins: ["Aarav Sharma"] },
  { id: 5, name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=rohan", last: "Let's sync at 5?", time: "Yesterday", unread: 0, pinned: false, status: "read", category: "personal", online: false, muted: false, archived: false, isGroup: false }
];

export const INITIAL_MESSAGES = {
  "Priya Patel": [
    { text: "Hey! How's the project going?", own: false, time: "2:30 PM", status: "read" },
    { text: "Almost done!", own: true, time: "2:32 PM", status: "read" },
    { text: "Sent the deck, check 🙌", own: false, time: "2:40 PM", status: "read" },
    { text: "", own: true, time: "2:42 PM", status: "read", voice: true, voiceDuration: 12 },
    { text: "Awesome, will review tonight ✨", own: true, time: "2:45 PM", status: "read" }
  ],
  "Kabootar Core": [
    { text: "Which calling stack?", own: false, time: "11:20 AM", status: "read" },
    { text: "", own: false, time: "11:22 AM", status: "read", poll: { question: "Agora vs LiveKit?", options: [{ t: "Agora", v: 4 }, { t: "LiveKit", v: 2 }] } },
    { text: "Agora looks clean", own: true, time: "11:30 AM", status: "read" }
  ],
  "Aarav Sharma": [
    { text: "", own: true, time: "9:15 AM", status: "read", voice: true, voiceDuration: 14 },
    { text: "Got it 👍", own: false, time: "9:20 AM", status: "read" }
  ],
  "Design Squad": [
    { text: "", own: false, time: "6:05 AM", status: "read", image: "https://picsum.photos/seed/palette/600/400" },
    { text: "New terracotta palette 🧡", own: false, time: "6:10 AM", status: "read" }
  ],
  "Rohan Gupta": [
    { text: "Let's sync at 5?", own: false, time: "Yesterday", status: "read" },
    { text: "Works for me 👍", own: true, time: "Yesterday", status: "read" }
  ]
};

export const CONTACTS = [
  { name: "Aarav Sharma", sub: "kb_aarav", avatar: "https://i.pravatar.cc/150?u=aarav", reg: true },
  { name: "Priya Patel", sub: "kb_priya", avatar: "https://i.pravatar.cc/150?u=priya", reg: true },
  { name: "Rohan Gupta", sub: "kb_rohan", avatar: "https://i.pravatar.cc/150?u=rohan", reg: true },
  { name: "Neha Verma", sub: "kb_neha", avatar: "https://i.pravatar.cc/150?u=neha", reg: true },
  { name: "Kabir Singh", sub: "kb_kabir", avatar: "https://i.pravatar.cc/150?u=kabir", reg: true },
  { name: "Meera Iyer", sub: "+91 98765 11111", avatar: "https://i.pravatar.cc/150?u=meera", reg: false }
];

export const CALLS = [
  { name: "Priya Patel", avatar: "https://i.pravatar.cc/150?u=priya", type: "video", status: "incoming", time: "Today, 2:30 PM", duration: "7:05" },
  { name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=rohan", type: "audio", status: "missed", time: "Today, 12:15 PM", duration: "" },
  { name: "Kabootar Core", avatar: "https://i.pravatar.cc/150?u=core", type: "video", status: "outgoing", time: "Yesterday", duration: "30:20" }
];

export const STATUSES = [
  { id: 1, name: "Priya Patel", avatar: "https://i.pravatar.cc/150?u=priya", time: "2 hours ago", viewed: false, items: [{ image: "https://picsum.photos/seed/s1a/600/1000", caption: "Mumbai mornings 🌤️" }] },
  { id: 2, name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=rohan", time: "4 hours ago", viewed: false, items: [{ image: "https://picsum.photos/seed/s2a/600/1000", caption: "Shipping day 🚀" }] },
  { id: 3, name: "Neha Verma", avatar: "https://i.pravatar.cc/150?u=neha", time: "Yesterday", viewed: true, items: [{ image: "https://picsum.photos/seed/s4a/600/1000", caption: "Design 🎨" }] }
];
