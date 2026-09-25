// src/lib/flashCall.js
//
// Mobile-number verification via a VOICE call instead of SMS, using
// 2Factor.in's free-tier API. This is the closest thing to a real "flash
// call" that's actually available for free without a backend server:
//   - A call is placed to the user's phone.
//   - 2Factor's automated voice reads the OTP digits out loud.
//   - The user types those digits into the app to verify.
//
// (A true silent flash-call — where the phone number itself, never
// answered, IS the code — needs a paid provider like Sinch/Vonage/Telesign
// with an app-side call-log reader. Not available free, and not usable
// from a plain web PWA anyway since browsers can't read the call log.)
//
// ── 2Factor.in setup ──────────────────────────────────────────────────
// 1. Sign up free at https://2factor.in — free trial credits included,
//    no card required.
// 2. Dashboard → API Keys → copy your key.
// 3. Paste it below. (See the security note in chat — this key ends up
//    in the public JS bundle since this app has no backend server.)
const TWOFACTOR_API_KEY = "YOUR_2FACTOR_API_KEY";

const BASE_URL = "https://2factor.in/API/V1";

// Turns "+919876543210" (or "9876543210") into the "919876543210" shape
// 2Factor's API expects — digits only, country code, no plus sign.
function toApiPhone(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

// Places the voice call and asks 2Factor to auto-generate + speak the
// OTP. Returns the sessionId you must pass to verifyFlashCall later.
export async function sendFlashCall(phone) {
  const apiPhone = toApiPhone(phone);
  if (!apiPhone) throw new Error("Phone number khaali hai");

  const res = await fetch(`${BASE_URL}/${TWOFACTOR_API_KEY}/VOICE/${apiPhone}/AUTOGEN`);
  const data = await res.json();

  if (data.Status !== "Success") {
    throw new Error(data.Details || "Call bhejne mein problem hui");
  }
  return data.Details; // sessionId
}

// Verifies the digits the user typed against the session 2Factor opened
// for the call above.
export async function verifyFlashCall(sessionId, otp) {
  if (!sessionId) throw new Error("Session expire ho gaya, dobara call mangwao");

  const res = await fetch(`${BASE_URL}/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`);
  const data = await res.json();

  return data.Status === "Success";
}
