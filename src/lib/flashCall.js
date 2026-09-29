// src/lib/flashCall.js
//
// Client side of phone-number login. All the sensitive work — calling
// 2Factor.in, checking the OTP, and minting a Firebase custom token — happens
// server-side in worker/otp.js, which is the only place the 2Factor API key
// and the Firebase service-account key ever exist. This file only talks to
// our own /api/flash-call/* endpoints.

// Turns "+91 98765 43210" / "9876543210" / etc into strict E.164 ("+919876543210").
// The server independently re-validates this — never trust client formatting
// for anything security-relevant — but doing it here gives instant feedback.
export function toE164(raw, defaultCountryCode = "+91") {
  if (!raw) return "";
  let digits = String(raw).replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  digits = digits.replace(/^0+/, "");
  return `${defaultCountryCode}${digits}`;
}

async function postJson(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Kuch galat ho gaya, dobara try karo");
  return data;
}

// Places the voice call. Returns an opaque, signed `challenge` string the
// browser must hold onto and send back with the OTP — it carries no secret,
// just a tamper-proof reference to this specific call.
export async function sendFlashCall(phone) {
  const { challenge } = await postJson("/api/flash-call/send", { phone: toE164(phone) });
  return challenge;
}

// Verifies the digits the user heard on the call. On success the server has
// already confirmed the phone number, so it returns a Firebase custom token —
// sign in with `signInWithCustomToken(auth, customToken)` to complete login.
export async function verifyFlashCall(challenge, otp) {
  return postJson("/api/flash-call/verify", { challenge, otp });
}
