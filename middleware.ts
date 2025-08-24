import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public endpoints (no session required)
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/me'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public assets & auth endpoints
  const normalized =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;
  if (
    PUBLIC_PATHS.includes(normalized) ||
    normalized.startsWith('/_next') ||
    normalized.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const session = req.cookies.get('session')?.value;
  if (session === 'raptor-session') {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store');
    if (process.env.NODE_ENV !== 'production') {
      res.headers.set('x-auth-debug', 'authenticated');
    }
    return res;
  }

  // Redirect to login
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('redirect', pathname);
  const redirectRes = NextResponse.redirect(loginUrl);
  if (process.env.NODE_ENV !== 'production') {
    redirectRes.headers.set('x-auth-debug', 'redirect-login');
  }
  return redirectRes;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
