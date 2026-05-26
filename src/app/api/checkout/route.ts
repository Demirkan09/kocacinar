import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateIyzicoAuthorization(apiKey: string, secretKey: string, randomString: string, hashString: string) {
  const hash = crypto
    .createHmac('sha1', secretKey)
    .update(apiKey + randomString + hashString)
    .digest('base64');
  return `IYZWS ${apiKey}:${hash}`;
}

export async function POST(request: Request) {
  try {
    const { cartItems, totalPrice, shippingFee, buyerInfo } = await request.json();

    const apiKey = process.env.IYZICO_API_KEY!;
    const secretKey = process.env.IYZICO_SECRET_KEY!;
    const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

    const randomString = Date.now().toString();
    const conversationId = `CONV_${randomString}`;

    const basketItems = cartItems.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      category1: item.category || "Şarküteri",
      itemType: "PHYSICAL",
      price: (item.price * item.quantity).toFixed(2),
    }));

    if (shippingFee > 0) {
      basketItems.push({
        id: "SHIPPING",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: "VIRTUAL",
        price: shippingFee.toFixed(2),
      });
    }

    const fullName = `${buyerInfo.first_name} ${buyerInfo.last_name}`.trim();

    const payload = {
      locale: "tr",
      conversationId,
      price: totalPrice.toFixed(2),
      paidPrice: totalPrice.toFixed(2),
      currency: "TRY",
      basketId: `BASKET_${randomString}`,
      paymentGroup: "PRODUCT",
      callbackUrl: "https://www.kocacinarciftlik.com/api/payment-callback",
      buyer: {
        id: "BYR_" + Date.now(),
        name: buyerInfo.first_name || "",
        surname: buyerInfo.last_name || "",
        gsmNumber: buyerInfo.phone || "+905551234567",
        email: buyerInfo.email || "",
        identityNumber: "11111111111",
        registrationAddress: buyerInfo.address || "",
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        zipCode: "09000",
        ip: "85.96.0.1"
      },
      shippingAddress: {
        contactName: fullName,
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        address: buyerInfo.address || "",
        zipCode: "09000"
      },
      billingAddress: {
        contactName: fullName,
        city: buyerInfo.city || "Aydın",
        country: "Turkey",
        address: buyerInfo.address || "",
        zipCode: "09000"
      },
      basketItems
    };

    // Hash String (iyzico için en kritik kısım)
    const buyerStr = `id=${payload.buyer.id},name=${payload.buyer.name},surname=${payload.buyer.surname},gsmNumber=${payload.buyer.gsmNumber},email=${payload.buyer.email},identityNumber=${payload.buyer.identityNumber},registrationAddress=${payload.buyer.registrationAddress},ip=${payload.buyer.ip},city=${payload.buyer.city},country=${payload.buyer.country},zipCode=${payload.buyer.zipCode}`;

    const addressStr = `contactName=${payload.shippingAddress.contactName},city=${payload.shippingAddress.city},country=${payload.shippingAddress.country},address=${payload.shippingAddress.address},zipCode=${payload.shippingAddress.zipCode}`;

    const basketStr = basketItems.map((i: any) => 
      `[id=${i.id},price=${i.price},name=${i.name},category1=${i.category1},itemType=${i.itemType}]`
    ).join(',');

    const hashString = `locale=${payload.locale},conversationId=${payload.conversationId},price=${payload.price},paidPrice=${payload.paidPrice},currency=${payload.currency},basketId=${payload.basketId},paymentGroup=${payload.paymentGroup},callbackUrl=${payload.callbackUrl},buyer=[${buyerStr}],shippingAddress=[${addressStr}],billingAddress=[${addressStr}],basketItems=[${basketStr}]`;

    const response = await fetch(`${baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-iyzi-rnd': randomString,
        'Authorization': generateIyzicoAuthorization(apiKey, secretKey, randomString, hashString)
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || 'Ödeme başlatılamadı' }, { status: 500 });
  }
}