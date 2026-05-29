import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Admin yetki kontrolü
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

// Tüm kategori görsellerini getir
export async function GET() {
  try {
    const res = await query('SELECT * FROM category_images');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Kategori görseli ekle veya güncelle
export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { category_name, image_url } = await request.json();
    if (!category_name) return NextResponse.json({ error: 'Kategori adı zorunlu' }, { status: 400 });

    if (!image_url) {
      // Eğer resim boş geldiyse kaydı tamamen sil
      await query('DELETE FROM category_images WHERE UPPER(category_name) = UPPER($1)', [category_name]);
      return NextResponse.json({ success: true, message: 'Görsel kaldırıldı.' });
    }

    // Varsa güncelle, yoksa yeni ekle (UPSERT)
    const res = await query(
      `INSERT INTO category_images (category_name, image_url) 
       VALUES (UPPER($1), $2) 
       ON CONFLICT (category_name) 
       DO UPDATE SET image_url = EXCLUDED.image_url 
       RETURNING *`,
      [category_name, image_url]
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}