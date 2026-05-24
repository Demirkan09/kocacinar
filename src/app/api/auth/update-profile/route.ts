import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, phone, address } = body;

    const cookieStore = await cookies();
    let token = cookieStore.get('kocacinar_session')?.value;

    if (!token) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/kocacinar_session=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        error: 'Oturum doğrulaması başarısız oldu. Lütfen tekrar giriş yapın.' 
      }, { status: 401 });
    }

    // Token'dan email çıkar
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      return NextResponse.json({ success: false, error: 'Geçersiz token.' }, { status: 401 });
    }

    const userData = JSON.parse(atob(tokenParts[1]));
    const userEmail = userData.email;

    if (!userEmail) {
      return NextResponse.json({ success: false, error: 'Geçersiz oturum.' }, { status: 401 });
    }

    // ✅ ADRES DAHİL GÜNCEL SQL SORGUSU
    // Eğer veritabanında 'address' sütununun adı farklıysa (örneğin 'addresses' gibi) burayı ona göre revize edebilirsin
    const sqlText = `
      UPDATE profiles 
      SET first_name = $1, 
          last_name = $2, 
          phone = $3,
          address = $4
      WHERE email = $5
      RETURNING *;
    `;
    
    const result = await query(sqlText, [
      String(firstName || '').trim(), 
      String(lastName || '').trim(), 
      String(phone || '').trim(),
      String(address || '[]'), // Adres boşsa boş JSON dizisi gönderiyoruz
      userEmail
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });

  } catch (error: any) {
    console.error('Profil güncelleme hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Sistemsel bir hata oluştu.' 
    }, { status: 500 });
  }
}