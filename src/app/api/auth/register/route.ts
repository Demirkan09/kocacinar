import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import crypto from 'crypto'; // Kanka import şeklini düzelttik, hata vermemesi için
import { sendKocaCinarMail } from '@/lib/mail';

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

    // 🔑 Rastgele benzersiz bir doğrulama token'ı üretiyoruz
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // ✅ Sütun isimleri tam istediğin gibi: first_name ve diğer yeni alanlar eklendi
    const insertQuery = `
      INSERT INTO profiles (
        first_name, 
        last_name, 
        email, 
        password_hash, 
        commercial_marketing_approved, 
        commercial_approval_at, 
        commercial_approval_ip,
        verification_token,
        is_verified
      ) 
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, FALSE) 
      RETURNING id, first_name, last_name, email, role
    `;
    
    const result = await query(insertQuery, [
      firstName, 
      lastName, 
      email, 
      passwordHash, 
      commercialMarketingApproved, 
      userIp,
      verificationToken
    ]);
    
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

    // 📩 ÜYELİK BİTTİĞİ AN ARKA PLANDA DOĞRULAMA MAİLİNİ FIRLATIYORUZ
    const verifyLink = `https://kocacinarciftlik.com/api/auth/verify-email?token=${verificationToken}`;

    try {
      await sendKocaCinarMail(
        email.trim(),
        "Koca Çınar Şarküteri Ailesine Hoş Geldiniz! 🌳 (E-Posta Doğrulama)",
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eef; border-radius: 20px;">
            <h2 style="color: #5e0d0f; text-align: center;">Koca Çınar Şarküteri'ye Hoş Geldiniz!</h2>
            <p>Merhaba <strong>${firstName}</strong>,</p>
            <p>Hesabınız başarıyla oluşturuldu. Sitemize şu andan itibaren giriş yapabilir, siparişlerinizi yönetebilirsiniz. Ancak özel indirimlerden, kuponlardan ve taze ürün kampanyalarımızdan haberdar olmak için lütfen e-posta adresinizi doğrulayın.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" style="background-color: #5e0d0f; color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">E-Posta Adresimi Doğrula</a>
            </div>
            <p style="color: #999; text-align: center; font-size: 11px;">Eğer bu üyeliği siz yapmadıysanız bu e-postayı dikkate almayınız.</p>
          </div>
        `
      );
    } catch (mailError) {
      // Mail gitmese bile kullanıcının kayıt sürecini kesmemek için hatayı loglayıp devam ediyoruz
      console.error('Doğrulama maili gönderilirken hata oluştu:', mailError);
    }

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