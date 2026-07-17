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

export async function PUT(request: Request) {
  if (!(await isAdminUser())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { items } = body; // Ana sayfadan gelecek olan: [{ id: X, sort_onecikan: 0 }, ...]

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Geçersiz veri formatı.' }, { status: 400 });
    }

    // Sadece sort_onecikan kolonunu güncelliyoruz, genel sort_order'a asla dokunmuyoruz!
    for (const item of items) {
      await query(
        'UPDATE products SET sort_onecikan = $1 WHERE id = $2',
        [item.sort_onecikan, item.id]
      );
    }

    return NextResponse.json({ success: true, message: 'Ana sayfa öne çıkanlar sıralaması başarıyla güncellendi. 🚀' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}