import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: Request) {
  try {
    // Cookie'den token'ı oku
    const token = request.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('kocacinar_session='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({ user: payload }, { status: 200 });
  } catch (error) {
    console.error('Me API Hatası:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}