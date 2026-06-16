import type { Handle, HandleServerError } from "@sveltejs/kit";
import { verifyToken } from "$lib/server/auth";
import { RateLimiter, securityHeaders } from "$lib/server/security";

// Rate limiter: 15 requests/min per IP on auth routes
const authLimiter = new RateLimiter(60_000, 15);

// Cleanup expired rate limit entries every 10 minutes
setInterval(() => authLimiter.cleanup(), 10 * 60_000);

export const handle: Handle = async ({ event, resolve }) => {
  // ── Rate limiting for auth routes ──────────────────────────────────
  const isAuthRoute = event.url.pathname.startsWith("/api/auth/");
  if (isAuthRoute) {
    const clientIp =
      event.getClientAddress?.() ??
      event.request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const { allowed, retryAfter } = authLimiter.check(clientIp);
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter ?? 60),
        },
      });
    }
  }

  // ── Auth: extract user from JWT token ──────────────────────────────
  const token = event.cookies.get("token");

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      event.locals.user = {
        id: payload.id,
        username: payload.username,
        email: payload.email ?? "",
        role: (payload.role ?? "AUTHOR") as "SUPERADMIN" | "EDITOR" | "AUTHOR",
      };
    }
  }

  // ── Resolve and add security headers ────────────────────────────────
  const response = await resolve(event);

  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
};

// ── Error handler ──────────────────────────────────────────────────────

export const handleError: HandleServerError = async ({ error, event }) => {
  const requestId = crypto.randomUUID();
  const path = event.url.pathname;
  const method = event.request.method;

  console.error(`[${requestId}] ${method} ${path}:`, error);

  // In production, send to monitoring service here

  return {
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : `${error}`,
    requestId
  };
};
