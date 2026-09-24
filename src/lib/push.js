// ── Fill these in after setting up Supabase (see the setup instructions) ──
const SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_PUBLIC_KEY";
const VAPID_PUBLIC_KEY = "BLFi1koUwjBuMbIPqGLbEeLnSL8dY8x55n99C5cQzXOLo80ai8R0IALF6lfwmeowYdOjav3H3gO9-KLAODsajPc";

// Baked in at build time by Next.js (see next.config.mjs). Empty string for
// a normal root deploy, "/<repo>" for a GitHub Pages sub-path deploy — this
// MUST match how the app itself was built, or the service worker's scope
// won't cover the app's routes.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Registers the app's service worker (offline caching + push). Safe to
// call multiple times — the browser no-ops if it's already registered and
// unchanged. Returns null on unsupported browsers or registration failure.
export async function registerServiceWorker() {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` });
  } catch {
    return null;
  }
}

// Call once after login. Asks for notification permission, subscribes this
// device/browser to push, and saves the subscription in Supabase so the
// Edge Function can find it later. Silently does nothing on browsers that
// don't support push (iOS Safari outside of an installed PWA, etc).
export async function subscribeToPush(uid) {
  if (typeof window === "undefined") return;
  if (!("PushManager" in window)) return;

  try {
    const reg = await registerServiceWorker();
    if (!reg) return;
    if (SUPABASE_URL.includes("YOUR_PROJECT_REF")) return; // push backend not configured yet — SW is still registered above for offline caching

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({ uid, endpoint: sub.endpoint, subscription: sub.toJSON() })
    });
  } catch {
    // best-effort — push not working shouldn't break the rest of the app
  }
}

// Fire-and-forget: ask the Edge Function to push a notification to someone.
export async function sendPushNotification(toUid, title, body) {
  if (SUPABASE_URL.includes("YOUR_PROJECT_REF")) return;
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({ toUid, title, body })
    });
  } catch {
    // best-effort
  }
}
