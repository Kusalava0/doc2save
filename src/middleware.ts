import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/constants';
import { verifySession } from '@/lib/auth';

const publicPaths = [
  '/',
  '/login',
  '/verify',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/payments/webhook',
];

const adminPaths = ['/admin', '/api/admin'];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

function isAdminPath(pathname: string): boolean {
  return adminPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Public paths don't need auth
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get session token
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify JWT
  const session = await verifySession(token);

  if (!session) {
    // Invalid/expired token — clear cookie
    const response = isApiRoute(pathname)
      ? NextResponse.json({ error: 'Session expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Admin route protection
  if (isAdminPath(pathname) && session.role !== 'ADMIN') {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Attach session to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-user-role', session.role);
  if (session.phone) requestHeaders.set('x-user-phone', session.phone);
  if (session.email) requestHeaders.set('x-user-email', session.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
