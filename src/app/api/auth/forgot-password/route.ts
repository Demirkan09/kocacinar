import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import { sendKocaCinarMail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'E-posta adresi zorunludur.' }, { status: 400 });
    }

    // Kullanıcı var mı kontrol et
    const userRes = await query('SELECT id, first_name FROM profiles WHERE email = $1', [email.trim()]);
    if (userRes.rowCount === 0) {
      // Güvenlik gereği kullanıcı yok demiyoruz, mail gönderildi süsü veriyoruz kanka
      return NextResponse.json({ success: true });
    }

    const user = userRes.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 Saat Sonra Süresi Dolar

    // Token'ları DB'ye yaz
    await query(
      'UPDATE profiles SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [resetToken, expires, email.trim()]
    );

    const resetLink = `https://kocacinarciftlik.com/sifre-sifirla?token=${resetToken}`;

    await sendKocaCinarMail(
      email.trim(),
      "Şifre Sıfırlama Talebi - Koca Çınar Şarküteri",
      `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #5e0d0f; text-align: center;">Şifre Sıfırlama</h2>
          <p>Merhaba <strong>${user.firstname || 'Ziyaretçimiz'}</strong>,</p>
          <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak 1 saat içinde şifrenizi yenileyebilirsiniz:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #5e0d0f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold;">Yeni Şifre Oluştur</a>
          </div>
          <p style="color: #999; font-size: 11px;">Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayınız.</p>
        </div>
      `
    );

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}