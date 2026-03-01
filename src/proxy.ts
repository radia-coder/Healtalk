import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (token?.status && token.status !== "ACTIVE") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Check role-based access
    if (path.startsWith("/patient/dashboard") && token?.role !== "PATIENT") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/psychologist/dashboard") && token?.role !== "PSYCHOLOGIST") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/admin/dashboard") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/patient/dashboard/:path*",
    "/psychologist/dashboard/:path*",
    "/admin/dashboard/:path*",
  ],
};
