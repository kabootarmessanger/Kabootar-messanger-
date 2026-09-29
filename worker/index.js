// Cloudflare Worker entry. Serves the Next.js static export from ./out (ASSETS)
// and handles the two server-side auth endpoints under /api/flash-call/*.
// Security headers for static files come from public/_headers.
import { handleSend, handleVerify } from "./otp.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith("/api/")) {
      if (request.method !== "POST") {
        return Response.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "POST" } });
      }
      try {
        if (pathname === "/api/flash-call/send") return await handleSend(request, env);
        if (pathname === "/api/flash-call/verify") return await handleVerify(request, env);
      } catch (err) {
        console.error("unhandled api error:", err?.message);
        return Response.json({ error: "Server error" }, { status: 500, headers: { "Cache-Control": "no-store" } });
      }
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  }
};
