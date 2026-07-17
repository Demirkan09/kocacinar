import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Eksik bilgiler.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    // Geçerli bir token var mı kontrol et (Süresi geçmemiş olmalı)
    const userCheck = await query(
      'SELECT id FROM profiles WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP',
      [token]
    );

    if (userCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' },
        { status: 400 }
      );
    }

    const userId = userCheck.rows[0].id;

    // Yeni şifreyi hashle
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Şifreyi güncelle ve token'ları temizle
    await query(
      'UPDATE profiles SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, userId]
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
