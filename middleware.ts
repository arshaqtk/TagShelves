import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { verifyToken } from "./lib/jwt";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export async function middleware(req: NextRequest) {
  try { 
    const path = req.nextUrl.pathname;

    // RATE LIMIT LOGIN API
    if (path === "/api/auth/login") {
      const rawIp = req.headers.get("x-forwarded-for") ?? "anonymous";
      const ip = rawIp.split(",")[0].trim();         //  extract first IP only

      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new Response("Too many requests", {
          status: 429,
          headers: { "Retry-After": "60" },
        });
      }
    }

    // PROTECTED ROUTES
    const protectedRoutes = ["/dashboard"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      path.startsWith(route)
    );

    if (isProtectedRoute) {
      const token = req.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();

  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/auth/login",
  ],
};