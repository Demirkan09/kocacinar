import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, message: 'Oturum kapatıldı.' });
  
  const host = request.headers.get('host') || '';
  const cookieOptions: any = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  };

  if (host.includes('kocacinarciftlik.com')) {
    cookieOptions.domain = '.kocacinarciftlik.com';
  }

  // Cookie'yi geçmiş bir tarihe ayarlayarak tarayıcıdan siliyoruz
  response.cookies.set('kocacinar_session', '', cookieOptions);

  return response;
}