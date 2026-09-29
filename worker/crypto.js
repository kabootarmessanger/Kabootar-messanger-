// Small WebCrypto helpers (Cloudflare Workers + Node 20+ both provide these).

const enc = new TextEncoder();

export function b64urlEncode(input) {
  const bytes = typeof input === "string" ? enc.encode(input) : new Uint8Array(input);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecodeToBytes(str) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacKey(secret, usages) {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, usages);
}

export async function hmacSign(secret, message) {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret, ["sign"]), enc.encode(message));
  return b64urlEncode(sig);
}

// Constant-time verification (crypto.subtle.verify does not short-circuit).
export async function hmacVerify(secret, message, signatureB64url) {
  try {
    return await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret, ["verify"]),
      b64urlDecodeToBytes(signatureB64url),
      enc.encode(message)
    );
  } catch {
    return false;
  }
}

function pemToPkcs8(pem) {
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

export async function signRS256(privateKeyPem, signingInput) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(signingInput));
  return b64urlEncode(sig);
}
