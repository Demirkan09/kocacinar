import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, password, commercialMarketingApproved } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Lütfen gerekli alanları doldurun.' }, { status: 400 });
    }

    if (!commercialMarketingApproved) {
      return NextResponse.json({ error: 'Yasal olarak devam edebilmek için ticari elektronik ileti onayını işaretlemelisiniz.' }, { status: 400 });
    }

    const userCheck = await query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kayıtlı.' }, { status: 400 });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let userIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (userIp.includes(',')) userIp = userIp.split(',')[0].trim();

    const insertQuery = `
      INSERT INTO profiles (first_name, last_name, email, password_hash, commercial_marketing_approved, commercial_approval_at, commercial_approval_ip) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6) 
      RETURNING id, first_name, last_name, email, role
    `;
    const result = await query(insertQuery, [firstName, lastName, email, passwordHash, commercialMarketingApproved, userIp]);
    const newUser = result.rows[0];

    // 🔥 jose ile Edge-ready JWT üretimi
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const token = await new SignJWT({ 
      userId: newUser.id, 
      email: newUser.email, 
      role: newUser.role,
      firstName: newUser.first_name,
      lastName: newUser.last_name 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const response = NextResponse.json({ message: 'Kayıt başarıyla tamamlandı.', user: newUser }, { status: 201 });

    response.cookies.set('kocacinar_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası meydana geldi.' }, { status: 500 });
  }
}