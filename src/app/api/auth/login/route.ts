// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Eğer takma adın @/lib/db ise böyle, yoksa ../../../lib/db yap
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Girdi kontrolü
    if (!email || !password) {
      return NextResponse.json({ error: 'Lütfen e-posta ve şifrenizi girin.' }, { status: 400 });
    }

    // 2. Kullanıcıyı veritabanında ara
    const result = await query('SELECT * FROM profiles WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'E-posta adresi veya şifre hatalı.' }, { status: 401 });
    }

    const user = result.rows[0];

    // 3. Şifre kontrolü (Veritabanındaki hash ile karşılaştırma)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'E-posta adresi veya şifre hatalı.' }, { status: 401 });
    }

    // 4. JWT Token Oluşturma (İçine kullanıcının id, email ve rolünü gömüyoruz)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'varsayilan_secret',
      { expiresIn: '7d' } // 7 gün boyunca geçerli olsun
    );

    // 5. Response oluştur ve içine HttpOnly Cookie yerleştir
    const response = NextResponse.json(
      { 
        message: 'Giriş başarılı!', 
        user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role } 
      }, 
      { status: 200 }
    );

    // Cookie ayarlarını yapıyoruz (Güvenlik tavan)
    const host = request.headers.get('host') || '';
    const cookieOptions: any = {
      httpOnly: true,
      secure: true, // Güvenli HTTPS bağlantısı için
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    };

    // www. ve bare domain (kocacinarciftlik.com) arasında cookie paylaşımını sağlamak için domain ayarı
    if (host.includes('kocacinarciftlik.com')) {
      cookieOptions.domain = '.kocacinarciftlik.com';
    }

    response.cookies.set('kocacinar_session', token, cookieOptions);

    return response;

  } catch (error) {
    console.error('Giriş hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası meydana geldi.' }, { status: 500 });
  }
}