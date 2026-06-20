import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { verifyToken } from "./lib/jwt";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export async function proxy(req: NextRequest) {
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

    // Proxy auth endpoints to Express server (port 5000)
    // /api/products is handled natively by Next.js API routes
    if (path.startsWith("/api/auth")) {
      const backendUrl = new URL(req.nextUrl.pathname + req.nextUrl.search, "http://127.0.0.1:5000");
      return NextResponse.rewrite(backendUrl);
    }

    // Token retrieval & verification
    const token = req.cookies.get("token")?.value;
    let decoded = null;

    if (token) {
      try {
        decoded = await verifyToken(token);
      } catch (err) {
        console.error("[Middleware] Invalid token:", err);
      }
    }

    // PROTECTED ROUTES
    const protectedRoutes = ["/dashboard", "/campaigns"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      path.startsWith(route)
    );

    if (isProtectedRoute) {
      if (!decoded) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("token");
        return response;
      }
    }

    // PUBLIC AUTH ROUTES (redirect to dashboard if already logged in)
    const authRoutes = ["/login", "/register", "/forgot-password", "/"];
    const isAuthRoute = authRoutes.includes(path);

    if (isAuthRoute && decoded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error("[Middleware] Error:", error);
    // Safe fallback to prevent redirect loops on public paths
    const path = req.nextUrl.pathname;
    if (path.startsWith("/dashboard") || path.startsWith("/campaigns")) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("token");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/campaigns/:path*",
    "/api/auth/:path*",
  ],
};
