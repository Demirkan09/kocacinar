import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// Veritabanı fonksiyonumuzu içeri alıyoruz
import { query } from '@/lib/db'; 

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

    const userEmail = payload.email;

    if (!userEmail) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // İŞTE YENİ EKLENEN KISIM: JWT onaylandıktan sonra veritabanından canlı veriyi çekiyoruz
    const sqlText = `SELECT * FROM profiles WHERE email = $1`;
    const result = await query(sqlText, [userEmail]);

    if (result.rowCount === 0) {
      // Veritabanında kullanıcı profili yoksa bile çökmemesi için token'daki eski veriyi döner
      return NextResponse.json({ user: payload }, { status: 200 });
    }

    const dbUser = result.rows[0];

    // Token içindeki kalıcı veriler (örn: rol, id) ile veritabanından gelen güncel bilgileri birleştiriyoruz
    const freshUser = {
      ...payload,
      ...dbUser
    };

    return NextResponse.json({ user: freshUser }, { status: 200 });

  } catch (error) {
    console.error('Me API Hatası:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}