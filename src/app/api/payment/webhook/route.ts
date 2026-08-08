import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';
import { sendTelegramOrderNotification } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    let payload: any = {};
    const contentType = request.headers.get('content-type') || '';

    // Gelen isteğin tipine göre veriyi çekiyoruz (JSON veya Form Data)
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        payload[key] = value;
      });
    } else {
      try {
        payload = await request.json();
      } catch {
        const text = await request.text();
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { rawBody: text };
        }
      }
    }

    console.log('İyzico Webhook Bildirimi Alındı:', payload);

    const token = payload.token || payload.checkoutFormToken;
    const status = payload.status;
    const iyziEventType = payload.iyziEventType;

    // Iyzipay istemcisini başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    let basketId = payload.basketId || payload.orderNo;
    let isPaymentSuccess = (status === 'SUCCESS' || status === 'OK' || iyziEventType === 'CHECKOUT_FORM_AUTH' || iyziEventType === 'PAYMENT');

    // Eğer elimizde Token varsa, İyzico API üzerinden sorgulayarak %100 doğrulamak en güvenli yoldur
    if (token) {
      try {
        const retrieveForm = () => {
          return new Promise((resolve, reject) => {
            iyzipay.checkoutForm.retrieve({
              locale: Iyzipay.LOCALE.TR,
              token: token.toString()
            }, (err: any, result: any) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        };

        const iyzicoResult: any = await retrieveForm();
        if (iyzicoResult) {
          if (iyzicoResult.basketId) {
            basketId = iyzicoResult.basketId;
          }
          if (iyzicoResult.status === 'success' && iyzicoResult.paymentStatus === 'SUCCESS') {
            isPaymentSuccess = true;
          } else if (iyzicoResult.status === 'failure' || iyzicoResult.paymentStatus === 'FAILURE') {
            isPaymentSuccess = false;
          }
        }
      } catch (err) {
        console.error('İyzico Form Doğrulama Hatası (Webhook):', err);
      }
    }

    // Eğer sipariş numarası (basketId) tespit edildiyse DB durumunu güncelliyoruz
    if (basketId) {
      if (isPaymentSuccess) {
        console.log(`Webhook: Sipariş #${basketId} ödemesi başarılı olarak işaretleniyor.`);
        await query(
          "UPDATE orders SET status = 'HAZIRLANIYOR' WHERE order_no = $1 AND status NOT IN ('TESLIM_EDILDI', 'IPTAL')",
          [basketId]
        );
        sendTelegramOrderNotification(basketId).catch(err => console.error('Webhook Telegram error:', err));
      } else {
        console.log(`Webhook: Sipariş #${basketId} ödemesi başarısız/iptal olarak işaretleniyor.`);
        await query(
          "UPDATE orders SET status = 'IPTAL' WHERE order_no = $1 AND status = 'ODEME_BEKLIYOR'",
          [basketId]
        );
      }
    }

    // İyzico'ya bildirim alındı yanıtı (200 OK) dönüyoruz
    return NextResponse.json({ status: 'OK' }, { status: 200 });

  } catch (error: any) {
    console.error('İyzico Webhook Hatası:', error);
    // İyzico sistemlerinin tekrar denemesi için bildirim alındı cevabı verilir
    return NextResponse.json({ status: 'OK', error: error.message }, { status: 200 });
  }
}
