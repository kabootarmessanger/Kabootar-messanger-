# Sirf fixed files

Ye zip sirf un files ka hai jo fix/add kiye gaye — poora app nahi hai.
Apne existing project mein ye files isi path pe copy-paste karke overwrite kar do:

- package.json
- next.config.mjs
- src/lib/firebase.js
- src/app/layout.js
- src/app/page.js
- src/app/login/page.js   ← NAYI file (lowercase "page.js")
- src/context/AuthContext.js
- src/components/AuthGate.js   ← NAYI file
- src/components/SettingsScreen.js

## ⚠️ Zaroori: ek purani file DELETE karni hai
`src/app/login/Page.js` (capital "P" wali) apne project se **delete** kar dena,
warna case-insensitive filesystem (Windows/Mac) pe do "page" files clash karengi.
Iski jagah upar wali nayi `src/app/login/page.js` (lowercase) use hogi.

## Dependency install karna na bhoolna
`package.json` mein `firebase` add kiya gaya hai, isliye copy karne ke baad:
```
npm install
```
