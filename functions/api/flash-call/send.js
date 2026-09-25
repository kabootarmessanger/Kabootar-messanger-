// Cloudflare Pages Function — POST /api/flash-call/send
//
// This runs on Cloudflare's server, not in the browser, so the 2Factor.in
// API key stays secret here instead of shipping in the public JS bundle.
//
// Setup: Cloudflare dashboard → your Pages project → Settings →
// Environment variables → add TWOFACTOR_API_KEY as a Secret (tick both
// Production and Preview). Get the key free at https://2factor.in
// (Dashboard → API Keys) — no card needed.

export async function onRequestPost({ request, env }) {
  try {
    const { phone } = await request.json();
    const apiPhone = String(phone || "").replace(/[^\d]/g, "");
    if (!apiPhone) {
      return Response.json({ error: "Phone number khaali hai" }, { status: 400 });
    }

    const apiKey = env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server par 2Factor API key set nahi hai" }, { status: 500 });
    }

    const res = await fetch(`https://2factor.in/API/V1/${apiKey}/VOICE/${apiPhone}/AUTOGEN`);
    const data = await res.json();

    if (data.Status !== "Success") {
      return Response.json({ error: data.Details || "Call bhejne mein problem hui" }, { status: 502 });
    }

    return Response.json({ sessionId: data.Details });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
