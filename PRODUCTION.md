# Production checklist — Kabootar Messenger

This file documents what was fixed to make the app production-ready, and
what you still need to configure yourself (secrets can't be filled in for
you).

## What changed

### Security
- **Phone-login OTP is now verified server-side.** Previously the browser
  called 2Factor.in directly with a hardcoded API key (`src/lib/flashCall.js`)
  and a Cloudflare Worker (`functions/api/flash-call/*`) duplicated the same
  logic — both shipped the key or required it as a raw secret with **no
  rate limiting**, so anyone could read the key out of the JS bundle (or hit
  the endpoint directly) and place free phone calls to arbitrary numbers
  (toll fraud) or brute-force OTPs. It's now handled entirely in
  `worker/otp.js`:
  - The 2Factor key and Firebase service-account key live only as Cloudflare
    Worker secrets, never in client code.
  - `/api/flash-call/send` and `/api/flash-call/verify` are rate-limited per
    IP and per phone/session (Cloudflare's built-in Rate Limiting binding).
  - On success, the server mints a **Firebase custom token** bound to a uid
    derived deterministically from the verified phone number
    (`worker/firebaseToken.js`), so `request.auth.uid` in Firestore/Storage
    rules can be trusted as "this really is that phone number" — the old
    anonymous-auth + client-writable `otp_requests` flow allowed anyone to
    also just call `updateProfile`/`ensureUserDoc` with someone else's
    number.
  - The OTP challenge is a signed, expiring token (HMAC), not a bare
    Firestore document anyone signed-in could poke at.
- **Firestore rules tightened**: message `create` now also checks
  `senderId == request.auth.uid` (previously any chat participant could
  write a message impersonating the other participant). Call docs now also
  cover the `joined`/`pairs` subcollections used by group calls, which had
  no rules at all before (open to any authenticated user).
- **Storage rules added** (`storage.rules`) — there were none, meaning any
  signed-in user could read or overwrite any file in the bucket. Now scoped
  to chat participants / the file owner, with a size cap.
- **No more hardcoded Firebase project keys** in `src/lib/firebase.js` —
  every deploy must supply its own `NEXT_PUBLIC_FIREBASE_*` values (see
  `.env.example`), so a fork of this repo can never accidentally write into
  the original project's database.
- **Security headers** added via `public/_headers` (HSTS, frame-deny,
  nosniff, a conservative Permissions-Policy).
- `.gitignore` was previously mangled — it contained a set of Firebase env
  values instead of ignore patterns (meaning `.env` files were **not**
  ignored). Rewritten properly.

### Cleanup (dead / duplicated code)
- Removed `functions/` — an exact duplicate of `worker/index.js`'s OTP logic
  for a Cloudflare *Pages Functions* target the project doesn't use
  (`wrangler.jsonc` targets Workers). Consolidated into `worker/otp.js`.
- Removed 9 stray files that were accidental copies of root config sitting
  inside `src/components/` (`page.js`, `package.json`, `next.config.mjs`,
  `postcss.config.js`, `tailwind.config.js`, `jsconfig.json`, `README.md`,
  `AppContext.js`, `PhoneLogin.js`) — these were dead code (unimported) but
  risked being edited by mistake instead of the real files, and
  `src/components/AppContext.js` was a **stale, out-of-sync duplicate** of
  `src/context/AppContext.js` (missing message-id backfill logic and using
  array-index-based delete/edit, which breaks after any earlier deletion).
- Removed `READ_ME_FIRST.md` and `.github/workflows/deploy.yml` — a GitHub
  Pages deploy workflow left over from before this project moved to
  Cloudflare Workers (`wrangler.jsonc`); keeping both would silently deploy
  two different, out-of-sync builds to two different places.
- Added `.eslintrc.json` (the project had the `eslint-config-next`
  dependency but no config, so `npm run lint` did nothing).

## You still need to do this yourself

1. **Firebase project**: create one at https://console.firebase.google.com,
   enable Authentication (Custom token sign-in — no provider toggle needed),
   Firestore, and Storage. Copy `.env.example` → `.env.local` and fill in
   the `NEXT_PUBLIC_FIREBASE_*` values from Project settings → General.
2. **Deploy the rules**: `firebase deploy --only firestore:rules,storage:rules`
   (needs the Firebase CLI and `firebase.json` pointing at these two rules
   files — not included here since it depends on your project id).
3. **2Factor.in account**: sign up free at https://2factor.in, copy your API
   key from the dashboard.
4. **Firebase service account**: Project settings → Service accounts →
   Generate new private key. This JSON file's `client_email` +
   `private_key` are what `worker/otp.js` uses to mint sign-in tokens —
   guard it like a password.
5. **Set Worker secrets** (never put these in `wrangler.jsonc` or git):
   ```bash
   wrangler secret put TWOFACTOR_API_KEY
   wrangler secret put OTP_HMAC_SECRET        # any long random string, e.g. `openssl rand -hex 32`
   wrangler secret put FIREBASE_SERVICE_ACCOUNT   # paste the whole JSON file contents
   ```
6. **Update `wrangler.jsonc`**: set `vars.ALLOWED_ORIGIN` to your real
   deployed domain (this blocks other sites from calling your OTP endpoints
   directly). Create two Rate Limiting namespaces in the Cloudflare
   dashboard (Workers & Pages → your account → Rate Limiting) and replace
   the placeholder `namespace_id`s.
7. **Build & deploy**:
   ```bash
   npm install
   npm run build      # -> ./out (static export)
   wrangler deploy
   ```
8. Optional, not required to ship: `src/lib/push.js` (web push via
   Supabase) and `src/components/AIModals.js` / `GifSearch.js` (Gemini /
   Tenor — user supplies their own API key in Settings) are already
   designed to no-op until configured; wire them up later if you want those
   features.

## Known scope limits (unchanged from the original demo)

`ChatsScreen`/`ChatRoom`/`ContactsScreen` (seed/demo data + localStorage)
and `RealChatRoom`/`RealCallScreen` (live Firestore + WebRTC) are two
parallel implementations — the app currently launches into the demo/local
experience by default. Wiring the demo screens to always use the real
backend is a product decision (which UI is "the" chat list) beyond a
security/production-readiness pass, and is worth doing next.
