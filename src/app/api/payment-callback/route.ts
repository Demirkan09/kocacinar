import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = formData.get('token');
    
    if (!token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com'}/sepet?error=Token_bulunamadi`, 303);
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

      // Kullanıcıyı direkt kendi siparişlerini göreceği Profil sekmesine yolluyoruz.
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com'}/profil?tab=siparis&success=true`, 303);
    } else {
      
      // 2. ÖDEME İPTAL/BAŞARISIZ -> SİPARİŞİ IPTAL YAP
      if (iyzicoResult.basketId) {
         await query("UPDATE orders SET status = 'IPTAL' WHERE order_no = $1", [iyzicoResult.basketId]);
      }
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com'}/sepet?error=Odeme_basarisiz`, 303);
    }

  } catch (error: any) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com'}/sepet?error=Sistem_Hatasi`, 303);
  }
}