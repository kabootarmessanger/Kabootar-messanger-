// Cloudflare Pages Function — POST /api/flash-call/verify
//
// Companion to send.js — checks the digits the user typed against the
// session 2Factor opened for the call. Same server-side-only API key.

export async function onRequestPost({ request, env }) {
  try {
    const { sessionId, otp } = await request.json();
    if (!sessionId || !otp) {
      return Response.json({ error: "sessionId ya otp missing hai" }, { status: 400 });
    }

    const apiKey = env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Server par 2Factor API key set nahi hai" }, { status: 500 });
    }

    const res = await fetch(`https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`);
    const data = await res.json();

    return Response.json({ success: data.Status === "Success" });
  } catch (err) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
