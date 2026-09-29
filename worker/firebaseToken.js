// Mints a Firebase Auth *custom token* without the firebase-admin SDK (which
// doesn't run on Workers). Spec:
// https://firebase.google.com/docs/auth/admin/create-custom-tokens#create_custom_tokens_using_a_third-party_jwt_library
import { b64urlEncode, signRS256, sha256Hex } from "./crypto.js";

const AUDIENCE = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";

// Stable uid derived from the verified phone number: the same number always
// maps to the same Firebase account, so logging in again on a new device
// restores the account (and its chats). No underscores on purpose — 1:1 chat
// ids are "<uidA>_<uidB>" and firestore.rules splits on "_".
export async function uidForPhone(phone) {
  return "k" + (await sha256Hex(`kabootar:phone:${phone}`)).slice(0, 31);
}

export function parseServiceAccount(raw) {
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT secret is not set");
  const sa = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!sa.client_email || !sa.private_key) throw new Error("FIREBASE_SERVICE_ACCOUNT is missing client_email/private_key");
  return sa;
}

export async function mintCustomToken(serviceAccountRaw, { phone }, nowSec = Math.floor(Date.now() / 1000)) {
  const sa = parseServiceAccount(serviceAccountRaw);
  const uid = await uidForPhone(phone);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: AUDIENCE,
    iat: nowSec,
    exp: nowSec + 3600, // Firebase max; the client exchanges it for its own long-lived session immediately
    uid,
    claims: { phone } // surfaces as request.auth.token.phone in Firestore/Storage rules
  };
  const signingInput = `${b64urlEncode(JSON.stringify(header))}.${b64urlEncode(JSON.stringify(payload))}`;
  const signature = await signRS256(sa.private_key, signingInput);
  return { customToken: `${signingInput}.${signature}`, uid };
}
