import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';

export async function POST(request: Request) {
  try {
    const { cartItems, totalPrice, shippingFee, buyerInfo } = await request.json();

    // Iyzipay ayarlarını başlat (Kendi keylerini .env'den alacak)
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
    });

    const randomString = Date.now().toString();
    const conversationId = `CONV_${randomString}`;

    // Sepet öğelerini Iyzipay'in istediği formata çevir
const basketItems = cartItems.map((item: any) => ({
      id: item.id.toString(), // Supabase DB'deki gerçek ürün ID'n (Sepet Numarası olur)
      name: item.name,
      category1: item.category || "Şarküteri",
      itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
      price: (item.price * item.quantity).toFixed(2), // Toplam fiyat (iyzico bunu baz alır)
      // === EKSİK OLAN KISIM BURASIYDI, BUNU EKLE ===
      quantity: item.quantity 
    }));

    if (shippingFee > 0) {
      basketItems.push({
        id: "SHIPPING",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: shippingFee.toFixed(2),
      });
    }

    const fullName = `${buyerInfo.first_name || ''} ${buyerInfo.last_name || ''}`.trim();

    // Payload'u hazırla
    const requestData = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: totalPrice.toFixed(2),
      paidPrice: totalPrice.toFixed(2),
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `BASKET_${randomString}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: "https://www.kocacinarciftlik.com/api/payment-callback",
      enabledInstallments: [2, 3, 6, 9],
      buyer: {
        id: "BYR_" + randomString,
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
    console.log("iyzico cevabı:", result);

    if (result.status === 'success') {
      return NextResponse.json(result);
    } else {
      // Geçersiz imza vb. durumlarda Iyzico'nun hata mesajını front-end'e dönüyoruz
      return NextResponse.json({ error: result.errorMessage }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || 'Ödeme başlatılamadı' }, { status: 500 });
  }
}