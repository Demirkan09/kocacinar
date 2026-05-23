import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Oturum kapatıldı.' });
  
  // Cookie'yi geçmiş bir tarihe ayarlayarak tarayıcıdan siliyoruz
  response.cookies.set('kocacinar_session', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}