import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Yönetici Yetki Kontrolü
async function isAdminUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('kocacinar_session')?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'varsayilan_gizli_anahtar_32_karakter_olmali');
    const { payload }: any = await jwtVerify(token, secret);
    const userId = payload.id || payload.userId || payload.sub;
    const res = await query('SELECT role FROM profiles WHERE id = $1', [userId]);
    return res.rows[0]?.role === 'admin';
  } catch { return false; }
}

// 1. Ürünler Sayfası İçin Tüm Kategorileri Sıralı Getir (GET)
export async function GET() {
  try {
    const res = await query('SELECT name FROM categories ORDER BY sort_order ASC');
    // Frontend kodumuz Array.isArray() beklediği için sadece isimleri dizi olarak dönüyoruz
    return NextResponse.json(res.rows.map(row => row.name));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Kategori Ekleme veya Sıralama Değiştirme (POST)
export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // A) Kategorilerin sırası yukarı/aşağı butonlarıyla değiştiğinde (reorder):
    if (body.action === 'reorder' && Array.isArray(body.items)) {
      for (let i = 0; i < body.items.length; i++) {
        await query(
          'UPDATE categories SET sort_order = $1 WHERE name = $2',
          [i, body.items[i]]
        );
      }
      return NextResponse.json({ success: true });
    }

    // B) Yeni bağımsız kategori ekleme işlemi:
    const { name } = body;
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Kategori adı boş olamaz.' }, { status: 400 });
    }

    const formattedName = name.trim().toUpperCase();

    // Çift kayıt kontrolü
    const checkExist = await query('SELECT id FROM categories WHERE name = $1', [formattedName]);
    if (checkExist.rows.length > 0) {
      return NextResponse.json({ error: 'Bu kategori zaten mevcut.' }, { status: 400 });
    }

    // Son sırayı bulup otomatik bir sonrasına ekleme
    const maxOrderRes = await query('SELECT COALESCE(MAX(sort_order), 0) as max_order FROM categories');
    const nextOrder = maxOrderRes.rows[0].max_order + 1;

    await query(
      'INSERT INTO categories (name, sort_order) VALUES ($1, $2)',
      [formattedName, nextOrder]
    );

    return NextResponse.json({ success: true, name: formattedName });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. Kategori Silme İşlemi (DELETE)
export async function DELETE(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Silinecek kategori adı belirtilmedi.' }, { status: 400 });
    }

    await query('DELETE FROM categories WHERE name = $1', [name.toUpperCase()]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}