import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Decode JWT payload without verifying signature
      // (Backend will verify the signature on API calls)
      const payloadBase64 = token.split(".")[1];
      const payloadJson = Buffer.from(payloadBase64, "base64").toString();
      const payload = JSON.parse(payloadJson);

      const allowedRoles = ["SUPER_ADMIN", "ADMIN", "STAFF"];
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If token is invalid or malformed
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
