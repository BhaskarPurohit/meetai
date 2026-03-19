import { NextRequest, NextResponse } from "next/server";

// ── Rate limiter: sliding window, in-process ───────────────────────────────
// Protects /api/stream/token from token-farming abuse.
// Limitation: state is per-isolate — not shared across Vercel Edge replicas.
// For true multi-region rate limiting, swap this for Upstash Redis:
// https://github.com/upstash/ratelimit
const STREAM_TOKEN_LIMIT = 10;          // max requests
const STREAM_TOKEN_WINDOW_MS = 60_000;  // per 60 seconds

const tokenBucket = new Map<string, { count: number; resetAt: number }>();

function checkStreamTokenLimit(ip: string): {
  limited: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = tokenBucket.get(ip);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + STREAM_TOKEN_WINDOW_MS;
    tokenBucket.set(ip, { count: 1, resetAt });
    return { limited: false, remaining: STREAM_TOKEN_LIMIT - 1, resetAt };
  }

  if (entry.count >= STREAM_TOKEN_LIMIT) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { limited: false, remaining: STREAM_TOKEN_LIMIT - entry.count, resetAt: entry.resetAt };
}

// ── Route config ───────────────────────────────────────────────────────────
const PUBLIC_PATHS = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/api/auth",
  "/api/health",
  "/_next",
  "/favicon.ico",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limit Stream token endpoint ──────────────────────────────────────
  if (pathname === "/api/stream/token") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const { limited, remaining, resetAt } = checkStreamTokenLimit(ip);

    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(STREAM_TOKEN_LIMIT),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    };

    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...rateLimitHeaders,
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    Object.entries(rateLimitHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }

  // ── Allow public paths ────────────────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // ── Session guard ─────────────────────────────────────────────────────────
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};