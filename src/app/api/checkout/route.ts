import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
  try {
    const { cartItems, totalPrice, shippingFee, buyerInfo } = await request.json();

    // Site ayarlarını al
    const settingsRes = await query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    settingsRes.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    const minOrderAmount = Number(settings.min_order_amount || '150');
    const baseShippingFee = Number(settings.shipping_fee || '75');
    const freeShippingThreshold = Number(settings.free_shipping_threshold || '2000');

    // Sepet tutarını hesapla ve doğrula
    const subtotal = cartItems.reduce((total: number, item: any) => total + (Number(item.price) * Number(item.quantity)), 0);
    if (subtotal < minOrderAmount) {
      return NextResponse.json({ error: `Sipariş verebilmek için minimum sepet tutarı ₺${minOrderAmount} olmalıdır.` }, { status: 400 });
    }

    const finalShippingFee = subtotal >= freeShippingThreshold ? 0 : baseShippingFee;
    const finalTotalPrice = subtotal + finalShippingFee;

    // 1. Kullanıcı ID'sini Çekiyoruz (Siparişi doğru kişiye bağlamak için)
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
      return NextResponse.json({ error: 'Lütfen ödeme yapmadan önce giriş yapın.' }, { status: 401 });
    }

    // Iyzipay ayarlarını başlat
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    const randomString = Date.now().toString();
    const conversationId = `CONV_${randomString}`;
    
    // 2. DB'de arayacağımız eşsiz sipariş kodunu üretiyoruz
    const orderNo = 'KC-' + Math.floor(100000 + Math.random() * 900000);

    // Sepet öğelerini Iyzipay'in istediği formata çevir
    const basketItems = cartItems.map((item: any) => ({
      id: item.id.toString(), 
      name: item.name,
      category1: item.category || "Şarküteri",
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: (item.price * item.quantity).toFixed(2), 
      quantity: item.quantity 
    }));

    if (finalShippingFee > 0) {
      basketItems.push({
        id: "SHIPPING",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: finalShippingFee.toFixed(2),
      });
    }

    const fullName = `${buyerInfo.first_name || ''} ${buyerInfo.last_name || ''}`.trim();

    // Payload'u hazırla
    const requestData = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: finalTotalPrice.toFixed(2),
      paidPrice: finalTotalPrice.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: orderNo, // 🛠️ Önemli: Bizim sipariş kodumuzu İyzico'ya gönderiyoruz
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.kocacinarciftlik.com"}/api/payment-callback`,
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: userId.toString(),
        name: buyerInfo.first_name || "Müşteri",
        surname: buyerInfo.last_name || "Soyadı",
        gsmNumber: buyerInfo.phone || "+905551234567",
        email: buyerInfo.email || "email@email.com",
        identityNumber: "11111111111",
        lastLoginDate: "2023-01-01 12:00:00",
        registrationDate: "2023-01-01 12:00:00",
        registrationAddress: buyerInfo.address || "Adres bilgisi girilmemiş",
        ip: "85.96.0.1",
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        zipCode: "09000"
      },
      shippingAddress: {
        contactName: fullName,
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        address: buyerInfo.address || "Adres bilgisi girilmemiş",
        zipCode: "09000"
      },
      billingAddress: {
        contactName: fullName,
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        address: buyerInfo.address || "Adres bilgisi girilmemiş",
        zipCode: "09000"
      },
      basketItems: basketItems
    };

    // Iyzipay kütüphanesi callback ile çalışır, Next.js için bunu Promise'e sarıyoruz
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
    
    // 3. EĞER IYZİCO BAŞARILI CEVAP VERDİYSE DB'YE KAYDET
    if (result.status === 'success') {
      await query(
        `INSERT INTO orders (order_no, user_id, buyer_name, buyer_phone, shipping_address, items, subtotal, shipping_fee, total_amount, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ODEME_BEKLIYOR')`,
        [orderNo, userId, fullName, buyerInfo.phone, buyerInfo.address, JSON.stringify(cartItems), subtotal, finalShippingFee, finalTotalPrice]
      );
      
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.errorMessage }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Ödeme başlatılamadı' }, { status: 500 });
  }
}