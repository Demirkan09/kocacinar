import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response("Geçersiz veya eksik token.", { status: 400 });
    }

    // Token'a ait kullanıcıyı bul ve doğrula
    const result = await query(
      `UPDATE profiles SET is_verified = TRUE, verification_token = NULL WHERE verification_token = $1 RETURNING *`,
      [token]
    );

    if (result.rowCount === 0) {
      return new Response("Bu doğrulama bağlantısı geçersiz veya süresi dolmuş.", { status: 400 });
    }

    // Kullanıcıyı tarayıcıda şık bir başarı sayfasına yönlendiriyoruz kanka:
    return NextResponse.redirect(new URL('/profil?verified=true', request.url));

  } catch (error: any) {
    return new Response("Sistemsel Hata: " + error.message, { status: 500 });
  }
}