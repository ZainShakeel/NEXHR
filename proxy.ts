import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = (token as any)?.role;

    // Super admin routes: check cookie-based session
    if (pathname.startsWith("/super-admin/") && pathname !== "/super-admin/login") {
      const session = req.cookies.get("super_admin_session");
      if (!session?.value) {
        return NextResponse.redirect(new URL("/super-admin/login", req.url));
      }
    }

    // Employee routes: only EMPLOYEE role allowed
    if (pathname.startsWith("/employee/") && pathname !== "/employee/login") {
      if (!token) {
        return NextResponse.redirect(new URL("/employee/login", req.url));
      }
      if (role !== "EMPLOYEE") {
        return NextResponse.redirect(new URL("/employee/login", req.url));
      }
    }

    // HR/Admin dashboard routes: only HR_ADMIN or COMPANY_ADMIN allowed
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (role !== "HR_ADMIN" && role !== "COMPANY_OWNER" && role !== "MANAGER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // let middleware function handle all auth logic
    },
  }
);

export const config = {
  matcher: ["/super-admin/:path*", "/employee/:path*", "/dashboard/:path*"],
};
