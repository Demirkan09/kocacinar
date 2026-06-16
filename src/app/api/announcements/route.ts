import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Admin Doğrulama Fonksiyonu
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

// 1. DUYURULARI GETİR (GET)
export async function GET() {
  try {
    // Tablonun varlığından emin olalım
    await query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const res = await query('SELECT * FROM announcements ORDER BY sort_order ASC, id ASC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error("Duyuruları Çekme Hatası:", error);
    // Hata durumunda varsayılan statik duyuruları döndürelim
    return NextResponse.json([
      { id: 1, text: " Türkiye'nin En Seçkin Şarküteri Lezzetleri", sort_order: 1 },
      { id: 2, text: " 2000 TL ve Üzeri Alışverişlerde Ücretsiz Kargo", sort_order: 2 },
      { id: 3, text: " %100 Doğal ve Katkısız Üretim Garantisi", sort_order: 3 },
      { id: 4, text: " Taze ve Günlük Yöresel Ürünler", sort_order: 4 },
      { id: 5, text: " Koca Çınar Güvencesiyle Sofranıza Doğallık", sort_order: 5 }
    ]);
  }
}

// 2. YENİ DUYURU EKLE (POST)
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { text, sort_order } = await request.json();
    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Duyuru metni boş olamaz.' }, { status: 400 });
    }

    const maxSortRes = await query('SELECT MAX(sort_order) as max_sort FROM announcements');
    const nextSort = (maxSortRes.rows[0]?.max_sort || 0) + 1;

    const res = await query(
      'INSERT INTO announcements (text, sort_order) VALUES ($1, $2) RETURNING *',
      [text.trim(), sort_order !== undefined ? parseInt(sort_order) : nextSort]
    );

    return NextResponse.json({ success: true, announcement: res.rows[0] });
  } catch (error: any) {
    console.error("Duyuru Ekleme Hatası:", error);
    return NextResponse.json({ error: 'Duyuru eklenirken hata oluştu.' }, { status: 500 });
  }
}

// 3. DUYURU GÜNCELLE VEYA SIRALA (PUT)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.action === 'reorder' && Array.isArray(body.items)) {
      for (const item of body.items) {
        await query('UPDATE announcements SET sort_order = $1 WHERE id = $2', [
          parseInt(item.sort_order),
          parseInt(item.id)
        ]);
      }
      return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
    }

    const { id, text } = body;
    if (!id || !text || !text.trim()) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    const res = await query(
      'UPDATE announcements SET text = $1 WHERE id = $2 RETURNING *',
      [text.trim(), parseInt(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Duyuru bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, announcement: res.rows[0] });
  } catch (error: any) {
    console.error("Duyuru Güncelleme Hatası:", error);
    return NextResponse.json({ error: 'Duyuru güncellenirken hata oluştu.' }, { status: 500 });
  }
}

// 4. DUYURU SİL (DELETE)
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Duyuru ID bilgisi eksik.' }, { status: 400 });
    }

    await query('DELETE FROM announcements WHERE id = $1', [parseInt(id)]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Duyuru Silme Hatası:", error);
    return NextResponse.json({ error: 'Duyuru silinirken hata oluştu.' }, { status: 500 });
  }
}
