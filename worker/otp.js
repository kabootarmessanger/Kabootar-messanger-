// Phone-number login: voice-call OTP via 2Factor.in, verified SERVER-SIDE, then a
// Firebase custom token is issued. The browser never sees the 2Factor key, and
// Firestore rules can trust request.auth.token.phone because only this code can
// mint tokens carrying it.
//
// Stateless design (no KV/DB needed): /send returns a signed "challenge"
// binding {2Factor sessionId, phone, expiry}; /verify only accepts an OTP
// together with an untampered, unexpired challenge.
import { hmacSign, hmacVerify, b64urlEncode, b64urlDecodeToBytes, sha256Hex } from "./crypto.js";
import { mintCustomToken } from "./firebaseToken.js";

const CHALLENGE_TTL_SEC = 5 * 60;
const E164 = /^\+[1-9]\d{7,14}$/;
const dec = new TextDecoder();

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function allowedPrefixes(env) {
  return String(env.ALLOWED_COUNTRY_CODES || "+91").split(",").map((s) => s.trim()).filter(Boolean);
}

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

// Same-origin only: browsers always send Origin on cross-site POSTs.
function originAllowed(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return true; // non-browser client (curl etc.) — still rate limited + signed
  const allowed = env.ALLOWED_ORIGIN || new URL(request.url).origin;
  return origin === allowed;
}

// Fail CLOSED if the limiter binding is missing: an unthrottled "place a phone
// call to any number" endpoint is a toll-fraud vector.
async function limited(binding, key) {
  if (!binding) return { missing: true };
  const { success } = await binding.limit({ key });
  return { ok: success };
}

async function readJson(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 4096) return null;
  try {
    const text = await request.text();
    if (text.length > 4096) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function callTwoFactor(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  return res.json();
}

export async function handleSend(request, env) {
  if (!originAllowed(request, env)) return json({ error: "Forbidden" }, 403);
  if (!env.TWOFACTOR_API_KEY || !env.OTP_HMAC_SECRET) return json({ error: "Server misconfigured" }, 500);

  const body = await readJson(request);
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  if (!E164.test(phone)) return json({ error: "Valid phone number daalo (country code ke saath)" }, 400);
  if (!allowedPrefixes(env).some((p) => phone.startsWith(p))) {
    return json({ error: "Abhi sirf India (+91) ke numbers supported hain" }, 400);
  }

  const phoneHash = (await sha256Hex(phone)).slice(0, 16);
  for (const key of [`ip:${clientIp(request)}`, `ph:${phoneHash}`]) {
    const r = await limited(env.OTP_SEND_LIMITER, key);
    if (r.missing) return json({ error: "Server misconfigured" }, 500);
    if (!r.ok) return json({ error: "Bahut zyada koshish — thodi der baad try karo" }, 429);
  }

  let data;
  try {
    data = await callTwoFactor(`https://2factor.in/API/V1/${env.TWOFACTOR_API_KEY}/VOICE/${phone.replace("+", "")}/AUTOGEN`);
  } catch {
    return json({ error: "OTP service abhi available nahi hai" }, 502);
  }
  if (data.Status !== "Success" || !data.Details) {
    return json({ error: "Call bhejne mein problem hui" }, 502);
  }

  const payload = b64urlEncode(JSON.stringify({ s: data.Details, p: phone, e: Math.floor(Date.now() / 1000) + CHALLENGE_TTL_SEC }));
  const challenge = `${payload}.${await hmacSign(env.OTP_HMAC_SECRET, payload)}`;
  return json({ challenge, expiresIn: CHALLENGE_TTL_SEC });
}

export async function handleVerify(request, env) {
  if (!originAllowed(request, env)) return json({ error: "Forbidden" }, 403);
  if (!env.TWOFACTOR_API_KEY || !env.OTP_HMAC_SECRET || !env.FIREBASE_SERVICE_ACCOUNT) {
    return json({ error: "Server misconfigured" }, 500);
  }

  const body = await readJson(request);
  const challenge = typeof body?.challenge === "string" ? body.challenge : "";
  const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
  if (!/^\d{4,8}$/.test(otp)) return json({ error: "OTP galat format mein hai" }, 400);

  const [payload, sig] = challenge.split(".");
  if (!payload || !sig || !(await hmacVerify(env.OTP_HMAC_SECRET, payload, sig))) {
    return json({ error: "Session invalid hai, dobara call mangwao" }, 400);
  }
  let claims;
  try {
    claims = JSON.parse(dec.decode(b64urlDecodeToBytes(payload)));
  } catch {
    return json({ error: "Session invalid hai, dobara call mangwao" }, 400);
  }
  if (!claims.s || !E164.test(claims.p || "") || Math.floor(Date.now() / 1000) > claims.e) {
    return json({ error: "OTP expire ho gaya, naya call mangwao" }, 400);
  }

  // Throttle guesses per session and per IP (a 6-digit OTP must not be brute-forceable).
  const sessionHash = (await sha256Hex(claims.s)).slice(0, 16);
  for (const key of [`s:${sessionHash}`, `ip:${clientIp(request)}`]) {
    const r = await limited(env.OTP_VERIFY_LIMITER, key);
    if (r.missing) return json({ error: "Server misconfigured" }, 500);
    if (!r.ok) return json({ error: "Bahut zyada galat koshish — naya call mangwao" }, 429);
  }

  let data;
  try {
    data = await callTwoFactor(`https://2factor.in/API/V1/${env.TWOFACTOR_API_KEY}/SMS/VERIFY/${encodeURIComponent(claims.s)}/${otp}`);
  } catch {
    return json({ error: "OTP service abhi available nahi hai" }, 502);
  }
  if (data.Status !== "Success") return json({ error: "Galat OTP, dobara check karo" }, 401);

  try {
    const { customToken, uid } = await mintCustomToken(env.FIREBASE_SERVICE_ACCOUNT, { phone: claims.p });
    return json({ customToken, uid, phone: claims.p });
  } catch (err) {
    console.error("mintCustomToken failed:", err?.message);
    return json({ error: "Server error" }, 500);
  }
}
