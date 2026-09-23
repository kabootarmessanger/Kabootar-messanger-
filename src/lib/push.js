// ── Fill these in after setting up Supabase (see the setup instructions) ──
const SUPABASE_URL = "https://pbacqdlohwsskrtbjbiu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_j_3Scil9E8-NXRysIE2fjg_x37eHON9";
const VAPID_PUBLIC_KEY = "BLFi1koUwjBuMbIPqGLbEeLnSL8dY8x55n99C5cQzXOLo80ai8R0IALF6lfwmeowYdOjav3H3gO9-KLAODsajPc";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

// Call once after login. Asks for notification permission, subscribes this
// device/browser to push, and saves the subscription in Supabase so the
// Edge Function can find it later. Silently does nothing on browsers that
// don't support push (iOS Safari outside of an installed PWA, etc).
export async function subscribeToPush(uid) {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (SUPABASE_URL.includes("YOUR_PROJECT_REF")) return; // not configured yet

  try {
    const reg = await navigator.serviceWorker.register("/Kabootar-messanger-/sw.js");
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
