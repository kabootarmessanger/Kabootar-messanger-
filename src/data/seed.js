export const CONTACTS = [
  { name: "Aarav Sharma", sub: "kb_aarav", avatar: "https://i.pravatar.cc/150?u=aarav", reg: true },
  { name: "Priya Patel", sub: "kb_priya", avatar: "https://i.pravatar.cc/150?u=priya", reg: true },
  { name: "Rohan Gupta", sub: "kb_rohan", avatar: "https://i.pravatar.cc/150?u=rohan", reg: true },
  { name: "Neha Verma", sub: "kb_neha", avatar: "https://i.pravatar.cc/150?u=neha", reg: true },
  { name: "Kabir Singh", sub: "kb_kabir", avatar: "https://i.pravatar.cc/150?u=kabir", reg: true },
  { name: "Meera Iyer", sub: "+91 98765 11111", avatar: "https://i.pravatar.cc/150?u=meera", reg: false }
];

export const INITIAL_CHATS = [
  { id: 1, name: "Priya Patel", avatar: "https://i.pravatar.cc/150?u=priya", last: "Sent the deck, check when free 🙌", time: "5m", unread: 2, pinned: true, status: "read", category: "personal", online: true, muted: false, archived: false, isGroup: false },
  { id: 2, name: "Kabootar Core", avatar: "https://i.pravatar.cc/150?u=core", last: "Poll closed — Agora wins 🚀", time: "30m", unread: 5, pinned: true, status: "delivered", category: "work", online: false, muted: false, archived: false, isGroup: true, members: ["Aarav Sharma", "Priya Patel", "Rohan Gupta"], admins: ["Aarav Sharma"] },
  { id: 3, name: "Aarav Sharma", avatar: "https://i.pravatar.cc/150?u=aarav", last: "🎙️ Voice message", time: "3h", unread: 0, pinned: false, status: "read", category: "personal", online: false, muted: false, archived: false, isGroup: false },
  { id: 4, name: "Design Squad", avatar: "https://i.pravatar.cc/150?u=design", last: "New palette 🧡", time: "6h", unread: 0, pinned: false, status: "read", category: "work", online: false, muted: true, archived: false, isGroup: true, members: ["Aarav Sharma", "Neha Verma", "Kabir Singh"], admins: ["Aarav Sharma"] },
  { id: 5, name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=rohan", last: "Let's sync at 5?", time: "Yesterday", unread: 0, pinned: false, status: "read", category: "personal", online: false, muted: false, archived: false, isGroup: false }
];

export const INITIAL_MESSAGES = {
  "Priya Patel": [
    { text: "Hey! How's the project going?", own: false, time: "2:30 PM", status: "read" },
    { text: "Almost done! Working on the chat UI", own: true, time: "2:32 PM", status: "read" },
    { text: "Sent the deck, check when free 🙌", own: false, time: "2:40 PM", status: "read" },
    { text: "", own: true, time: "2:42 PM", status: "read", voice: true, voiceDuration: 12 },
    { text: "Awesome, will review tonight ✨", own: true, time: "2:45 PM", status: "read" }
  ],
  "Kabootar Core": [
    { text: "Which calling stack for v1?", own: false, time: "11:20 AM", status: "read" },
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

export const EMOJIS = ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","🤔","😐","😑","😶","😏","😒","🙄","😬","😌","😔","😪","😴","😷","🤯","🥳","🥺","🤓","😎","👻","💀","🤖","💩","❤️","🧡","💛","💚","💙","💜","🖤","💔","💕","💖","💘","👍","👎","👌","✌️","🤞","🤟","🤘","👋","🙏","🙌","👏","🤝","💪","💯","🔥","⭐","✨","💫","✅","❌","💡","🎉","🎊","🎁"];

export const SMART_REPLIES = ["Got it 👍", "Sounds good!", "Sure!", "Let me check", "Thanks!", "Okay 😊", "On my way"];

export const STICKER_PACKS = {
  Smileys: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😋","😛","😜","🤪","🤔"],
  Animals: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦆","🦅"],
  Food: ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🥝","🍍","🥥","🍕","🍔","🍟","🌭","🍿","🍩","🍪","🎂","🍰","🍫"],
  Activity: ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎽","⛸️","🥌","🎿"],
  Travel: ["✈️","🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚐","🚚","🚜","🛵","🚲","🛺","🚀"]
};

export const QUICK_RESPONSES = [
  "👍 Got it", "✅ Confirmed", "❌ Can't do", "⏰ On my way", "📞 Call me",
  "💤 Busy now", "🎉 Congrats!", "🙏 Thanks!", "👋 Hi", "🚀 On it"
];

export const TIMER_OPTIONS = [
  { label: "5s", seconds: 5, group: "Instant" },
  { label: "10s", seconds: 10, group: "Instant" },
  { label: "30s", seconds: 30, group: "Instant" },
  { label: "1 min", seconds: 60, group: "Minutes" },
  { label: "5 min", seconds: 300, group: "Minutes" },
  { label: "15 min", seconds: 900, group: "Minutes" },
  { label: "1 hr", seconds: 3600, group: "Hours" },
  { label: "6 hr", seconds: 21600, group: "Hours" },
  { label: "24 hr", seconds: 86400, group: "Hours" },
  { label: "7 days", seconds: 604800, group: "Days" },
  { label: "90 days", seconds: 7776000, group: "Days" }
];

export const ACCENT_COLORS = [
  { id: "terracotta", hex: "#C85A32" },
  { id: "blue", hex: "#3B82F6" },
  { id: "green", hex: "#25D366" },
  { id: "purple", hex: "#8B5CF6" },
  { id: "pink", hex: "#EC4899" },
  { id: "orange", hex: "#F97316" },
  { id: "teal", hex: "#14B8A6" },
  { id: "indigo", hex: "#6366F1" }
];

export const GLOBAL_WALLPAPERS = [
  ["default", "Default", "linear-gradient(135deg,#EFEAE2,#E0D8CC)"],
  ["plain", "Plain", "#F0F2F5"],
  ["terracotta", "Terracotta", "linear-gradient(180deg,#FDF2EE,#F9E1D8)"]
];

export const CHAT_WALLPAPERS = [
  { id: "default", bg: "linear-gradient(135deg,#EFEAE2,#E0D8CC)" },
  { id: "plain", bg: "#F0F2F5" },
  { id: "terracotta", bg: "linear-gradient(180deg,#FDF2EE,#F9E1D8)" },
  { id: "forest", bg: "linear-gradient(180deg,#E7F0E7,#C8E6C9)" },
  { id: "ocean", bg: "linear-gradient(180deg,#E0F2FE,#BAE6FD)" },
  { id: "sunset", bg: "linear-gradient(180deg,#FEF3C7,#FED7AA 50%,#FCA5A5)" },
  { id: "dark", bg: "#0B141A" },
  { id: "midnight", bg: "linear-gradient(180deg,#1a1a2e,#16213e)" },
  { id: "rose", bg: "linear-gradient(180deg,#FCE7F3,#FBCFE8)" }
];

export const FONT_SIZES = [
  { id: "small", label: "Small", scale: 87 },
  { id: "medium", label: "Medium", scale: 100 },
  { id: "large", label: "Large", scale: 113 },
  { id: "xl", label: "Extra Large", scale: 127 }
];

export const PE_FILTERS = [
  { id: "none", label: "Original", css: "none" },
  { id: "warm", label: "Warm", css: "sepia(.4) saturate(1.3)" },
  { id: "cool", label: "Cool", css: "hue-rotate(180deg) saturate(1.2)" },
  { id: "bw", label: "B&W", css: "grayscale(1)" },
  { id: "vintage", label: "Vintage", css: "sepia(.6) contrast(1.2)" },
  { id: "bright", label: "Bright", css: "brightness(1.3) saturate(1.2)" },
  { id: "dark", label: "Dark", css: "brightness(.8) contrast(1.3)" }
];

export const ACHIEVEMENTS = [
  { id: "first_msg", icon: "💬", name: "First Steps", desc: "Send 1st message" },
  { id: "msgs_100", icon: "💯", name: "Chatterbox", desc: "100 messages" },
  { id: "voice_10", icon: "🎙️", name: "Voice Master", desc: "10 voice notes" },
  { id: "media_25", icon: "📷", name: "Photographer", desc: "25 media" },
  { id: "streak_7", icon: "🔥", name: "On Fire", desc: "7-day streak" },
  { id: "streak_30", icon: "🏆", name: "Unstoppable", desc: "30-day streak" },
  { id: "starred_5", icon: "⭐", name: "Curator", desc: "Star 5 messages" },
  { id: "group_3", icon: "👥", name: "Groupie", desc: "3 groups" },
  { id: "call_10", icon: "📞", name: "Talkative", desc: "10 calls" }
];

export const DEFAULT_CATALOG = [
  { id: 1, name: "Terracotta Mug", price: 399, stock: 15, img: "https://picsum.photos/seed/mug/300/300" },
  { id: 2, name: "Kabootar Tote", price: 599, stock: 8, img: "https://picsum.photos/seed/tote/300/300" }
];

export const ONBOARD_STEPS = [
  { icon: "🕊️", title: "Welcome to Kabootar", desc: "Fast, private messaging for everyone." },
  { icon: "💬", title: "Chat Freely", desc: "Voice notes, images, polls, groups and more." },
  { icon: "✨", title: "Everything You Need", desc: "Themes, achievements, business tools — ready when you are." }
];
