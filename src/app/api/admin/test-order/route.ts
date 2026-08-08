import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { sendTelegramOrderNotification } from '@/lib/telegram';

async function getAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload }: any = await jwtVerify(token, secret);
    const userId = payload.id || payload.userId || payload.sub;
    const res = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    if (res.rows[0]?.role !== 'admin') return null;
    return { id: userId };
  } catch {
    return null;
  }
}

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Yetkisiz erişim. Sadece yöneticiler test siparişi oluşturabilir.' }, { status: 403 });
  }

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

    const orderNo = 'KC-TEST-' + Math.floor(100000 + Math.random() * 900000);

    const sampleItems = [
      { id: 101, name: "Aydın Olgunlaştırılmış Ezine Peyniri (500g)", price: 280, quantity: 2 },
      { id: 102, name: "Geleneksel Ev Yapımı İncir Reçeli (450g)", price: 140, quantity: 1 },
      { id: 103, name: "Kars Gravyeri Özel Seçim (300g)", price: 320, quantity: 1 }
    ];

    const subtotal = 1020;
    const shippingFee = 0;
    const totalAmount = 1020;

    const buyerName = "Ahmet Yılmaz (Test Müşterisi)";
    const buyerPhone = "5551234567";
    const shippingAddress = "Mah: Yedi Eylül Mah., Atatürk Bulvarı No: 42 D: 5, Efeler / Aydın, PK: 09100";
    const billingAddress = shippingAddress;

    const res = await query(
      `INSERT INTO orders (
         order_no, user_id, buyer_name, buyer_phone, shipping_address, 
         items, subtotal, shipping_fee, total_amount, status,
         billing_address, same_as_shipping, is_corporate, company_name, tax_number, tax_office
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'HAZIRLANIYOR', $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        orderNo, 
        admin.id, 
        buyerName, 
        buyerPhone, 
        shippingAddress, 
        JSON.stringify(sampleItems), 
        subtotal, 
        shippingFee, 
        totalAmount,
        billingAddress,
        true,
        false,
        null,
        null,
        null
      ]
    );

    // Telegram bildirimi gönder
    sendTelegramOrderNotification(orderNo).catch(err => console.error('Test siparişi Telegram bildirimi hatası:', err));

    return NextResponse.json({ success: true, order: res.rows[0] });
  } catch (error: any) {
    console.error('Test siparişi oluşturma hatası:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
