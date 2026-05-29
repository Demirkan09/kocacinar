import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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

// Seçilen ana sayfa kategorilerini getir
export async function GET() {
  try {
    const res = await query('SELECT category_name FROM homepage_categories ORDER BY sort_order ASC');
    return NextResponse.json(res.rows.map(row => row.category_name));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 5 Kategoriyi Kaydet/Set Et
export async function POST(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }
  try {
    const { categories } = await request.json(); // ['PEYNİR', 'ZEYTİN', ...]
    if (!Array.isArray(categories) || categories.length !== 5) {
      return NextResponse.json({ error: 'Tam olarak 5 kategori seçmelisiniz.' }, { status: 400 });
    }

    await query('DELETE FROM homepage_categories'); // Öncekileri temizle
    for (let i = 0; i < categories.length; i++) {
      await query(
        'INSERT INTO homepage_categories (category_name, sort_order) VALUES (UPPER($1), $2)',
        [categories[i], i]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}