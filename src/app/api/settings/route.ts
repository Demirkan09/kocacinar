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

// 1. AYARLARI GETİR (GET)
export async function GET() {
  try {
    // Tablonun varlığından emin olalım
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value VARCHAR(255) NOT NULL
      )
    `);

    const res = await query('SELECT key, value FROM site_settings');
    const settings: Record<string, string> = {};
    res.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    // Varsayılan Değerleri Kontrol Et ve Doldur
    if (!settings.min_order_amount) {
      await query("INSERT INTO site_settings (key, value) VALUES ('min_order_amount', '150') ON CONFLICT (key) DO NOTHING");
      settings.min_order_amount = '150';
    }
    if (!settings.shipping_fee) {
      await query("INSERT INTO site_settings (key, value) VALUES ('shipping_fee', '75') ON CONFLICT (key) DO NOTHING");
      settings.shipping_fee = '75';
    }
    if (!settings.free_shipping_threshold) {
      await query("INSERT INTO site_settings (key, value) VALUES ('free_shipping_threshold', '2000') ON CONFLICT (key) DO NOTHING");
      settings.free_shipping_threshold = '2000';
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Ayarlar Yükleme Hatası:", error);
    // Veritabanı bağlantısı yoksa veya hata verirse fallback döndür
    return NextResponse.json({
      min_order_amount: '150',
      shipping_fee: '75',
      free_shipping_threshold: '2000'
    });
  }
}

// 2. AYARLARI GÜNCELLE (PUT)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { min_order_amount, shipping_fee, free_shipping_threshold } = await request.json();

    if (min_order_amount !== undefined) {
      await query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['min_order_amount', String(min_order_amount)]
      );
    }
    if (shipping_fee !== undefined) {
      await query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['shipping_fee', String(shipping_fee)]
      );
    }
    if (free_shipping_threshold !== undefined) {
      await query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['free_shipping_threshold', String(free_shipping_threshold)]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Ayarlar Güncelleme Hatası:", error);
    return NextResponse.json({ error: 'Ayarlar kaydedilirken bir hata oluştu.' }, { status: 500 });
  }
}
