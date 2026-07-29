import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';

async function handleCallback(request: Request) {
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com').replace(/\/$/, '');

  try {
    let token: string | null = null;
    const { searchParams } = new URL(request.url);
    token = searchParams.get('token');

    if (!token && request.method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        token = formData.get('token')?.toString() || null;
      } else if (contentType.includes('application/json')) {
        const json = await request.json();
        token = json.token || json.checkoutFormToken || null;
      }
    }

    if (!token) {
      console.error('Callback Hatası: Token bulunamadı');
      return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=Token_bulunamadi`);
    }

    // Iyzipay ayarlarını başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    // Token ile İyzico'ya sorgu atıp ödeme durumunu sorguluyoruz
    const checkPaymentStatus = () => {
      return new Promise((resolve, reject) => {
        iyzipay.checkoutForm.retrieve({
          locale: Iyzipay.LOCALE.TR,
          token: token!.toString()
        }, function (err: any, result: any) {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const iyzicoResult: any = await checkPaymentStatus();
    console.log('İyzico Callback Sonucu:', iyzicoResult);

    if (iyzicoResult && iyzicoResult.status === 'success' && iyzicoResult.paymentStatus === 'SUCCESS') {
      
      // 1. ÖDEME BAŞARILI -> DB'de Siparişi HAZIRLANIYOR Yap
      if (iyzicoResult.basketId) {
        await query(
          "UPDATE orders SET status = 'HAZIRLANIYOR' WHERE order_no = $1 AND status NOT IN ('TESLIM_EDILDI')",
          [iyzicoResult.basketId]
        );
      }

      // Müşteriyi Başarılı Ödeme Sayfasına Yönlendir
      return htmlRedirect(`${baseUrl}/odeme-basarili`);
    } else {
      
      // 2. ÖDEME BAŞARISIZ / İPTAL -> DB'de Siparişi IPTAL Yap
      if (iyzicoResult && iyzicoResult.basketId) {
        await query(
          "UPDATE orders SET status = 'IPTAL' WHERE order_no = $1 AND status = 'ODEME_BEKLIYOR'",
          [iyzicoResult.basketId]
        );
      }
      
      const errorMsg = encodeURIComponent(iyzicoResult?.errorMessage || 'Odeme_basarisiz');
      return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=${errorMsg}`);
    }

  } catch (error: any) {
    console.error('Callback Sunucu Hatası:', error);
    return htmlRedirect(`${baseUrl}/odeme-basarisiz?error=Sistem_Hatasi`);
  }
}

export async function POST(request: Request) {
  return handleCallback(request);
}

export async function GET(request: Request) {
  return handleCallback(request);
}

// Nginx, Cloudflare ve 3D-Secure POST yönlendirme sorunlarını aşan HTML Redirect fonksiyonu
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
