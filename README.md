# functions/

This folder is reserved for serverless/backend functions (e.g. real chat
persistence, auth, push notifications) that the current demo does **not**
need, since all data lives in the browser (React state + localStorage).

When you're ready to add a real backend, two common options:

## Option A — Next.js API routes (simplest, no extra hosting)
Create files under `src/app/api/<name>/route.js`, e.g.:

```js
// src/app/api/send-message/route.js
export async function POST(req) {
  const body = await req.json();
  // ...save to your database...
  return Response.json({ ok: true });
}
```

These deploy automatically with the Next.js app on Vercel/Node hosting —
no separate "functions" folder needed.

## Option B — Standalone serverless functions (Firebase / Netlify / AWS)
If you prefer Firebase Cloud Functions or Netlify Functions, put them here,
e.g. `functions/sendMessage.js`, and deploy them with that platform's CLI
(`firebase deploy --only functions`, `netlify deploy`, etc.). They are kept
separate from `src/` intentionally so the Next.js app and backend functions
can be deployed independently.

Suggested next steps for a real backend:
- Auth: Firebase Auth / Clerk / NextAuth
- Realtime messages: Firestore, Supabase Realtime, or a WebSocket server
- Media storage: Firebase Storage / S3 / Cloudinary
- Push notifications: FCM / OneSignal
