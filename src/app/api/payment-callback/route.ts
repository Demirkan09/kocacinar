import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';

export async function POST(request: Request) {
  try {
    // Iyzico callback isteğini x-www-form-urlencoded olarak atar
    const formData = await request.formData();
    const token = formData.get('token');
    console.log("Gelen Veriler -> Token:", token);
    if (!token) {
      console.log("HATA: Iyzico'dan token gelmedi!");
      return NextResponse.json({ error: 'Token bulunamadı' }, { status: 400 });
    }
      console.log("Iyzico Config Kontrolü");
    // Iyzipay ayarlarını başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    // Token ile iyzico'ya gidip ödemenin gerçekten başarılı olup olmadığını sorguluyoruz (Güvenlik Önlemi)
    const checkPaymentStatus = () => {
      return new Promise((resolve, reject) => {
        iyzipay.checkoutForm.retrieve({
          locale: Iyzipay.LOCALE.TR,
          token: token.toString()
        }, function (err: any, result: any) {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const iyzicoResult: any = await checkPaymentStatus();
    console.log("=== CALLBACK DOĞRULAMA CEVABI ===", iyzicoResult);
    if (iyzicoResult.status === 'success' && iyzicoResult.paymentStatus === 'SUCCESS') {
      
      // === BURASI SİPARİŞİ ONAYLAMA ALANI ===
      // 1. Kardo, burada Supabase'e (DB) gidip sipariş durumunu "Ödendi" yapacaksın.
      // 2. Stokları düşebilirsin.
      // 3. Sepeti temizlemek için frontend'e bir işaret gönderebilirsin.
      
      console.log("Ödeme başarıyla doğrulandı, sipariş onaylanıyor...");

      // Müşteriyi sitendeki başarılı sayfasına yönlendiriyoruz
      // Kullanıcının tarayıcısında bu sayfa açılacak
      return NextResponse.redirect(new URL(`/odeme-basarili?token=${token}`, request.url), 303);
    } else {
      console.log("Doğrulama başarısız! Iyzico hata mesajı:", iyzicoResult.errorMessage);
      // Ödeme doğrulaması başarısızsa
      return NextResponse.redirect(new URL('/odeme-basarisiz?reason=verification_failed', request.url), 303);
    }

  } catch (error: any) {
    console.error("Callback Error:", error);
    return NextResponse.redirect(new URL('/odeme-basarisiz?reason=server_error', request.url), 303);
  }
}