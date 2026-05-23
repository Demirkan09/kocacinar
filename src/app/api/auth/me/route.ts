import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // BURASI ÖNEMLİ: cookies() artık bir promise olduğu için await ekledik
    const cookieStore = await cookies(); 
    const token = cookieStore.get('kocacinar_session')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const secret = new TextEncoder().encode('kocacinar1234567890abcdef');
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ user: payload }, { status: 200 });

  } catch (error) {
    console.error('Me API Hatası:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}