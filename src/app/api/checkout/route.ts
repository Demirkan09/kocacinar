import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { cartItems, totalPrice, shippingFee, buyerInfo } = await request.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({
        status: 'failure',
        error: 'Sepetinizde ürün bulunmamaktadır.',
        errorMessage: 'Sepetinizde ürün bulunmamaktadır.'
      }, { status: 400 });
    }

    // Site ayarlarını al
    let settings: Record<string, string> = {};
    try {
      const settingsRes = await query('SELECT key, value FROM site_settings');
      settingsRes.rows.forEach(row => {
        settings[row.key] = row.value;
      });
    } catch (e) {
      console.warn('site_settings tablosu okunamadı, varsayılan ayarlar kullanılacak.', e);
    }
    
    const minOrderAmount = Number(settings.min_order_amount || '150');
    const baseShippingFee = Number(settings.shipping_fee || '75');
    const freeShippingThreshold = Number(settings.free_shipping_threshold || '2000');

    // Sepet tutarlarını hassas hesapla
    let calculatedSubtotal = 0;
    const basketItems = cartItems.map((item: any) => {
      const itemTotalPrice = Number((Number(item.price) * Number(item.quantity)).toFixed(2));
      calculatedSubtotal += itemTotalPrice;
      return {
        id: item.id ? item.id.toString() : Math.random().toString(),
        name: item.name || 'Şarküteri Ürünü',
        category1: item.category || "Şarküteri",
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: itemTotalPrice.toFixed(2)
      };
    });

    if (calculatedSubtotal < minOrderAmount) {
      return NextResponse.json({
        status: 'failure',
        error: `Sipariş verebilmek için minimum sepet tutarı ₺${minOrderAmount} olmalıdır.`,
        errorMessage: `Sipariş verebilmek için minimum sepet tutarı ₺${minOrderAmount} olmalıdır.`
      }, { status: 400 });
    }

    const finalShippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : baseShippingFee;
    if (finalShippingFee > 0) {
      basketItems.push({
        id: "SHIPPING",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: finalShippingFee.toFixed(2)
      });
    }

    const calculatedTotalPrice = (calculatedSubtotal + finalShippingFee).toFixed(2);

    // 1. Kullanıcı ID'sini Çekiyoruz
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    let userId = null;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
        const { payload }: any = await jwtVerify(token, secret);
        userId = payload.id || payload.userId || payload.sub;
      } catch (e) {}
    }

    if (!userId) {
      return NextResponse.json({
        status: 'failure',
        error: 'Lütfen ödeme yapmadan önce giriş yapın.',
        errorMessage: 'Lütfen ödeme yapmadan önce giriş yapın.'
      }, { status: 401 });
    }

    // Iyzipay ayarlarını başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    const randomString = Date.now().toString();
    const conversationId = `CONV_${randomString}`;
    
    // DB'de arayacağımız eşsiz sipariş kodunu üretiyoruz
    const orderNo = 'KC-' + Math.floor(100000 + Math.random() * 900000);

    const fullName = `${buyerInfo.first_name || ''} ${buyerInfo.last_name || ''}`.trim() || 'Müşteri';
    const sameAsShipping = buyerInfo.same_as_shipping !== false;
    const isCorporate = buyerInfo.is_corporate === true;

    const billingFullName = sameAsShipping
      ? fullName
      : `${buyerInfo.billing_first_name || buyerInfo.first_name || ''} ${buyerInfo.billing_last_name || buyerInfo.last_name || ''}`.trim() || fullName;
    
    const shippingAddressStr = buyerInfo.address || "Teslimat Adresi";
    const billingAddressStr = sameAsShipping
      ? shippingAddressStr
      : (buyerInfo.billing_address || shippingAddressStr);
      
    const shippingCityStr = buyerInfo.city || "Aydın";
    const billingCityStr = sameAsShipping
      ? shippingCityStr
      : (buyerInfo.billing_city || shippingCityStr);

    const zipCode = (buyerInfo.postcode || '09000').trim();
    const billingZipCode = (buyerInfo.billing_postcode || zipCode).trim();

    // GSM Numarasını +90 formatına tam zorla
    let rawPhone = (buyerInfo.phone || '').replace(/\D/g, '');
    if (rawPhone.startsWith('0')) {
      rawPhone = rawPhone.slice(1);
    }
    if (!rawPhone.startsWith('90')) {
      rawPhone = '90' + rawPhone;
    }
    let gsmNumber = '+' + rawPhone;
    if (gsmNumber.length < 12) {
      gsmNumber = '+905551234567';
    }

    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.kocacinarciftlik.com').replace(/\/$/, '');
    const callbackUrl = `${baseUrl}/api/payment-callback`;

    // Payload'u hazırla
    const requestData: any = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: calculatedTotalPrice,
      paidPrice: calculatedTotalPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: orderNo,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: callbackUrl,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: userId.toString(),
        name: buyerInfo.first_name || "Müşteri",
        surname: buyerInfo.last_name || "Müşteri",
        gsmNumber: gsmNumber,
        email: buyerInfo.email || "email@email.com",
        identityNumber: (buyerInfo.tax_number && isCorporate) ? buyerInfo.tax_number : "11111111111",
        lastLoginDate: "2026-01-01 12:00:00",
        registrationDate: "2026-01-01 12:00:00",
        registrationAddress: shippingAddressStr,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || "85.96.0.1",
        city: shippingCityStr,
        country: "Turkey",
        zipCode: zipCode
      },
      shippingAddress: {
        contactName: fullName,
        city: shippingCityStr,
        country: "Turkey",
        address: shippingAddressStr,
        zipCode: zipCode
      },
      billingAddress: {
        contactName: (isCorporate && buyerInfo.company_name) ? buyerInfo.company_name : billingFullName,
        city: billingCityStr,
        country: "Turkey",
        address: billingAddressStr,
        zipCode: billingZipCode
      },
      basketItems: basketItems
    };

    // Iyzipay kütüphanesi callback ile çalışır, Next.js için Promise'e sarıyoruz
    const initializeCheckout = () => {
      return new Promise((resolve, reject) => {
        iyzipay.checkoutFormInitialize.create(requestData, function (err: any, result: any) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };

    const result: any = await initializeCheckout();
    
    // EĞER IYZİCO BAŞARILI CEVAP VERDİYSE DB'YE KAYDET
    if (result && result.status === 'success') {
      try {
        // Tablo kolonlarının varlığını otomatik doğrula ve eksikse oluştur
        await query(`
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS same_as_shipping BOOLEAN DEFAULT TRUE;
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_corporate BOOLEAN DEFAULT FALSE;
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name TEXT;
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_number TEXT;
          ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_office TEXT;
        `);

        await query(
          `INSERT INTO orders (
             order_no, user_id, buyer_name, buyer_phone, shipping_address, 
             items, subtotal, shipping_fee, total_amount, status,
             billing_address, same_as_shipping, is_corporate, company_name, tax_number, tax_office
           ) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ODEME_BEKLIYOR', $10, $11, $12, $13, $14, $15)`,
          [
            orderNo, 
            userId, 
            fullName, 
            buyerInfo.phone, 
            shippingAddressStr, 
            JSON.stringify(cartItems), 
            calculatedSubtotal, 
            finalShippingFee, 
            Number(calculatedTotalPrice),
            billingAddressStr,
            sameAsShipping,
            isCorporate,
            buyerInfo.company_name || null,
            buyerInfo.tax_number || null,
            buyerInfo.tax_office || null
          ]
        );
      } catch (dbError) {
        console.error('Sipariş DB kayıt hatası (İyzico formu yine de açılacak):', dbError);
      }
      
      return NextResponse.json(result);
    } else {
      console.error('İyzico Başlatma Başarısız:', result);
      const errorText = result?.errorMessage || result?.error || 'İyzico ödeme formu oluşturulamadı.';
      return NextResponse.json({
        status: 'failure',
        error: errorText,
        errorMessage: errorText,
        result
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Checkout API Genel Hatası:', error);
    const errorText = error?.message || 'Ödeme başlatılırken beklenmeyen bir hata oluştu.';
    return NextResponse.json({
      status: 'failure',
      error: errorText,
      errorMessage: errorText
    }, { status: 500 });
  }
}