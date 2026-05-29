import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { join } from 'path';

// Admin Doğrulama Fonksiyonu (Aynen Korundu)
async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    if (!token) return false;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload }: any = await jwtVerify(token, secret);
    
    const currentUserId = payload.id || payload.userId || payload.sub;
    if (!currentUserId) return false;

    const res = await query('SELECT role FROM profiles WHERE id = $1', [currentUserId]);
    return res.rows[0]?.role === 'admin';
  } catch {
    return false;
  }
}

// 1. ÜRÜNLERİ LİSTELEME (GET - Aynen Korundu)
export async function GET() {
  try {
    const res = await query('SELECT * FROM products ORDER BY sort_order ASC, id DESC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. YENİ ÜRÜN EKLEME (POST - JSON Tabanlı Güncellendi)
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    // 🛠️ FIX: FormData yerine frontend'den gelen Base64 barındıran JSON verisini okuyoruz
    const body = await request.json();
    const { name, price, old_price, image_url, category, unit } = body;
    
    if (!name || !price) {
      return NextResponse.json({ error: 'İsim ve fiyat alanları zorunludur.' }, { status: 400 });
    }

    const finalImageUrl = image_url || '/about.jpg';
    const parsedOldPrice = old_price ? parseFloat(old_price) : null;

    // Yeni ürünün en arkada düzgün listelenmesi için maksimum sıra numarasını buluyoruz
    const maxOrderRes = await query('SELECT MAX(sort_order) as max_order FROM products');
    const nextOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;

    // unit ve sort_order kuralları birebir korundu
    const res = await query(
      'INSERT INTO products (name, price, old_price, image_url, category, unit, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name.trim(), parseFloat(price), parsedOldPrice, finalImageUrl, category || 'PEYNİR', unit || 'kg', nextOrder]
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ÜRÜN GÜNESLLEME VE SIRALAMA (PUT - JSON Tabanlı Tek Çatıda Birleştirildi)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // 📋 Senaryo A: Sürükle-bırak ile sıralama değiştirildiyse (Eski mantık aynen korundu)
    if (body.action === 'reorder' && Array.isArray(body.items)) {
      for (const item of body.items) {
        await query('UPDATE products SET sort_order = $1 WHERE id = $2', [
          parseInt(item.sort_order),
          parseInt(item.id)
        ]);
      }
      return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
    }

    // 📝 Senaryo B: Normal ürün bilgilerini düzenleme (JSON uyumlu)
    const { id, name, price, old_price, image_url, category, unit } = body;

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    const parsedOldPrice = old_price ? parseFloat(old_price) : null;

    // Düzenleme işlemi ve unit entegrasyonu korundu
    const res = await query(
      'UPDATE products SET name = $1, price = $2, old_price = $3, image_url = $4, category = $5, unit = $6 WHERE id = $7 RETURNING *',
      [name.trim(), parseFloat(price), parsedOldPrice, image_url, category || 'PEYNİR', unit || 'kg', parseInt(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Güncellenecek ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. ÜRÜN SİLME (DELETE - Aynen Korundu)
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Ürün ID bilgisi eksik.' }, { status: 400 });

    // Ürünü silmeden önce veritabanından siliyoruz
    await query('DELETE FROM products WHERE id = $1', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}