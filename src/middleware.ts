import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('kocacinar_session')?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode('kocacinar1234567890abcdef');
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch (err) {
      // Token geçersiz veya süresi dolmuşsa cookie'yi temizle
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('kocacinar_session');
      return response;
    }
  }

  // Korunan Sayfa: Profil
  if (!isAuthenticated && pathname.startsWith('/profil')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Giriş yapmış kullanıcının tekrar login/register görmesini engelle
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/profil', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profil/:path*', '/login', '/register'],
};