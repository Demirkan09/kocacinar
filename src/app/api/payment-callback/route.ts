import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com';

  try {
    const formData = await request.formData();
    const token = formData.get('token');
    
    if (!token) {
      return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=Token_bulunamadi`);
    }
    
    // Iyzipay ayarlarını başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    // Token ile iyzico'ya gidip ödemenin gerçekten başarılı olup olmadığını sorguluyoruz
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
    
    if (iyzicoResult.status === 'success' && iyzicoResult.paymentStatus === 'SUCCESS') {
      
      // 1. ÖDEME BAŞARILI -> SİPARİŞİ DB'DE BUL VE HAZIRLANIYOR YAP
      if (iyzicoResult.basketId) {
         await query("UPDATE orders SET status = 'HAZIRLANIYOR' WHERE order_no = $1", [iyzicoResult.basketId]);
      }

      // Başarılı ödeme sayfasına güvenli HTML yönlendirmesi
      return htmlRedirect(`${baseUrl}/odeme-basarili`);
    } else {
      
      // 2. ÖDEME İPTAL/BAŞARISIZ -> SİPARİŞİ IPTAL YAP
      if (iyzicoResult.basketId) {
         await query("UPDATE orders SET status = 'IPTAL' WHERE order_no = $1", [iyzicoResult.basketId]);
      }
      
      // Başarısız ödeme sayfasına hata koduyla birlikte yönlendirme
      return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=Odeme_basarisiz`);
    }

  } catch (error: any) {
    console.error('Callback Hatası:', error);
    return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=Sistem_Hatasi`);
  }
}

// Nginx/Cloudflare proxy ve POST yönlendirme sorunlarını aşan HTML Redirect fonksiyonu
function htmlRedirect(url: string) {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Yönlendiriliyorsunuz...</title>
        <meta http-equiv="refresh" content="0;url=${url}">
      </head>
      <body>
        <script>window.location.href = "${url}";</script>
        <p>Lütfen bekleyin, yönlendiriliyorsunuz... Eğer yönlenme gerçekleşmezse <a href="${url}">buraya tıklayın</a>.</p>
      </body>
    </html>
    `,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}