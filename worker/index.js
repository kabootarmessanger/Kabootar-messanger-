// Cloudflare Worker entry point.
//
// Handles /api/flash-call/* itself (this is where the 2Factor.in API key
// lives, server-side, set as a secret in the Cloudflare dashboard — see
// TWOFACTOR_API_KEY below). Everything else is served as a static file
// from the Next.js export in ./out via the ASSETS binding.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/flash-call/send" && request.method === "POST") {
      return handleSend(request, env);
    }
    if (url.pathname === "/api/flash-call/verify" && request.method === "POST") {
      return handleVerify(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleSend(request, env) {
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

async function handleVerify(request, env) {
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
