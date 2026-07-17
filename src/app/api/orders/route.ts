import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Kimlik ve Admin Doğrulama
async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload }: any = await jwtVerify(token, secret);
    const userId = payload.id || payload.userId || payload.sub;
    const res = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    return { id: userId, role: res.rows[0]?.role };
  } catch { return null; }
}

// 1. TÜM SİPARİŞLERİ GETİR (Sadece Admin)
export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

  try {
    const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. YENİ SİPARİŞ OLUŞTUR (Ödeme başarılı olduğunda çağrılacak)
export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Giriş yapmanız gerekli' }, { status: 401 });

  try {
    const body = await request.json();
    const { buyer_name, buyer_phone, shipping_address, items, subtotal, shipping_fee, total_amount } = body;
    const orderNo = 'KC-' + Math.floor(100000 + Math.random() * 900000); // Örn: KC-458921

    const res = await query(
      `INSERT INTO orders (order_no, user_id, buyer_name, buyer_phone, shipping_address, items, subtotal, shipping_fee, total_amount, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'HAZIRLANIYOR') RETURNING *`,
      [orderNo, user.id, buyer_name, buyer_phone, shipping_address, JSON.stringify(items), subtotal, shipping_fee, total_amount]
    );
    return NextResponse.json({ success: true, order: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. SİPARİŞ DURUMU VEYA KARGO KODU GÜNCELLE (Sadece Admin)
export async function PUT(request: Request) {
  const user = await getUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });

  try {
    const { id, status, tracking_code } = await request.json();
    const res = await query(
      'UPDATE orders SET status = $1, tracking_code = $2 WHERE id = $3 RETURNING *',
      [status, tracking_code || null, id]
    );
    return NextResponse.json({ success: true, order: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}