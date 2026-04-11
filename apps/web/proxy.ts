import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  defaultLocale,
  detectLocale,
  isLocale,
} from "./lib/i18n/config";

function pathnameHasLocale(pathname: string) {
  const [, maybeLocale] = pathname.split("/");
  return isLocale(maybeLocale);
}

/**
 * Next.js 16 `proxy.ts`: provide default export so the handler is registered.
 * Named `proxy` export kept for compatibility with tooling that looks for it.
 */
function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathnameHasLocale(pathname)) return NextResponse.next();

  const locale = detectLocale(request.headers.get("accept-language")) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export default proxy;
export { proxy };

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
