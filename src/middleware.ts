import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"]
const AUTH_API_PREFIX = "/api/auth"

const ROLE_RULES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/approvals", roles: ["ADMIN", "MANAGER"] },
  { prefix: "/vendors", roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"] },
  { prefix: "/rfqs", roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"] },
  { prefix: "/quotations", roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"] },
  { prefix: "/purchase-orders", roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"] },
  { prefix: "/invoices", roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"] },
  { prefix: "/reports", roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"] },
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith(AUTH_API_PREFIX) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    salt: "authjs.session-token",
  })

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublic) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  const role = (token as { role?: string }).role
  if (role) {
    const rule = ROLE_RULES.find((r) => pathname.startsWith(r.prefix))
    if (rule && !rule.roles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
