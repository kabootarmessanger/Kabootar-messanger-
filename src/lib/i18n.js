export const LANGUAGES = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "hi", flag: "🇮🇳", name: "हिन्दी" },
  { code: "mr", flag: "🇮🇳", name: "मराठी" },
  { code: "ta", flag: "🇮🇳", name: "தமிழ்" },
  { code: "bn", flag: "🇧🇩", name: "বাংলা" }
];

const DICT = {
  en: {
    chats: "Chats", status: "Status", calls: "Calls", settings: "Settings",
    searchChats: "Search chats", message: "Message", noChats: "No chats",
    startConversation: "Start a new conversation", noCalls: "No calls",
    callHistory: "Your call history appears here", all: "All", missed: "Missed",
    myStatus: "My Status", tapToAdd: "Tap to add status update",
    recentUpdates: "Recent updates", viewedUpdates: "Viewed updates",
    account: "Account", privacy: "Privacy", appearance: "Appearance",
    logOut: "Log Out", editProfile: "Edit Profile", appLock: "App Lock",
    darkMode: "Dark Mode", online: "online", lastSeen: "last seen recently"
  },
  hi: {
    chats: "चैट्स", status: "स्टेटस", calls: "कॉल्स", settings: "सेटिंग्स",
    searchChats: "चैट खोजें", message: "मैसेज", noChats: "कोई चैट नहीं",
    startConversation: "नई बातचीत शुरू करें", noCalls: "कोई कॉल नहीं",
    callHistory: "आपकी कॉल हिस्ट्री यहाँ दिखेगी", all: "सभी", missed: "मिस्ड",
    myStatus: "मेरा स्टेटस", tapToAdd: "स्टेटस जोड़ने के लिए टैप करें",
    recentUpdates: "हाल के अपडेट", viewedUpdates: "देखे गए अपडेट",
    account: "अकाउंट", privacy: "प्राइवेसी", appearance: "दिखावट",
    logOut: "लॉग आउट", editProfile: "प्रोफ़ाइल बदलें", appLock: "ऐप लॉक",
    darkMode: "डार्क मोड", online: "ऑनलाइन", lastSeen: "हाल ही में देखा गया"
  },
  mr: {
    chats: "चॅट्स", status: "स्टेटस", calls: "कॉल्स", settings: "सेटिंग्ज",
    searchChats: "चॅट शोधा", message: "मेसेज", noChats: "चॅट नाहीत",
    startConversation: "नवीन संभाषण सुरू करा", noCalls: "कॉल नाहीत",
    callHistory: "तुमचा कॉल इतिहास इथे दिसेल", all: "सर्व", missed: "मिस्ड",
    myStatus: "माझा स्टेटस", tapToAdd: "स्टेटस जोडण्यासाठी टॅप करा",
    recentUpdates: "अलीकडील अपडेट्स", viewedUpdates: "पाहिलेले अपडेट्स",
    account: "खाते", privacy: "गोपनीयता", appearance: "दिसणे",
    logOut: "लॉग आउट", editProfile: "प्रोफाइल संपादित करा", appLock: "अ‍ॅप लॉक",
    darkMode: "डार्क मोड", online: "ऑनलाइन", lastSeen: "अलीकडे पाहिले"
  },
  ta: {
    chats: "அரட்டைகள்", status: "நிலை", calls: "அழைப்புகள்", settings: "அமைப்புகள்",
    searchChats: "அரட்டைகளைத் தேடு", message: "செய்தி", noChats: "அரட்டைகள் இல்லை",
    startConversation: "புதிய உரையாடலைத் தொடங்கு", noCalls: "அழைப்புகள் இல்லை",
    callHistory: "உங்கள் அழைப்பு வரலாறு இங்கே தோன்றும்", all: "அனைத்தும்", missed: "தவறவிட்டது",
    myStatus: "எனது நிலை", tapToAdd: "நிலையைச் சேர்க்க தட்டவும்",
    recentUpdates: "சமீபத்திய புதுப்பிப்புகள்", viewedUpdates: "பார்த்த புதுப்பிப்புகள்",
    account: "கணக்கு", privacy: "தனியுரிமை", appearance: "தோற்றம்",
    logOut: "வெளியேறு", editProfile: "சுயவிவரத்தைத் திருத்து", appLock: "ஆப் லாக்",
    darkMode: "டார்க் மோட்", online: "ஆன்லைன்", lastSeen: "சமீபத்தில் பார்த்தது"
  },
  bn: {
    chats: "চ্যাট", status: "স্ট্যাটাস", calls: "কল", settings: "সেটিংস",
    searchChats: "চ্যাট খুঁজুন", message: "বার্তা", noChats: "কোনো চ্যাট নেই",
    startConversation: "নতুন কথোপকথন শুরু করুন", noCalls: "কোনো কল নেই",
    callHistory: "আপনার কল ইতিহাস এখানে দেখাবে", all: "সব", missed: "মিসড",
    myStatus: "আমার স্ট্যাটাস", tapToAdd: "স্ট্যাটাস যোগ করতে ট্যাপ করুন",
    recentUpdates: "সাম্প্রতিক আপডেট", viewedUpdates: "দেখা আপডেট",
    account: "অ্যাকাউন্ট", privacy: "গোপনীয়তা", appearance: "চেহারা",
    logOut: "লগ আউট", editProfile: "প্রোফাইল সম্পাদনা", appLock: "অ্যাপ লক",
    darkMode: "ডার্ক মোড", online: "অনলাইন", lastSeen: "সম্প্রতি দেখা গেছে"
  }
};

export function t(lang, key) {
  return (DICT[lang] && DICT[lang][key]) || DICT.en[key] || key;
}
