import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { join } from 'path';
// 🛠️ EKLENDİ: unlink modülü ile diskteki fiziksel dosyaları siliyoruz
import { writeFile, unlink } from 'fs/promises';

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

// 1. ÜRÜNLERİ LİSTELEME (GET)
export async function GET() {
  try {
    const admin = await isAdmin();
    let res;
    if (admin) {
      res = await query('SELECT * FROM products ORDER BY sort_order ASC, id DESC');
    } else {
      res = await query('SELECT * FROM products WHERE is_active = true ORDER BY sort_order ASC, id DESC');
    }
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. YENİ ÜRÜN EKLEME (POST)
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // EĞER İSTEK JSON İSE (TOPLU ÜRÜN EKLEME)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const productsToAdd = Array.isArray(body) ? body : (body.products && Array.isArray(body.products) ? body.products : null);
      if (!productsToAdd) {
        return NextResponse.json({ error: 'Geçersiz veri biçimi. Ürün dizisi bekleniyor.' }, { status: 400 });
      }

      // Validasyon: Tüm ürünleri kontrol et
      for (const prod of productsToAdd) {
        if (!prod.name || prod.price === undefined || prod.price === null) {
          return NextResponse.json({ error: 'Tüm ürünlerde isim ve fiyat alanları zorunludur.' }, { status: 400 });
        }
      }

      const insertedProducts = [];
      const maxOrderRes = await query('SELECT MAX(sort_order) as max_order FROM products');
      let currentOrder = maxOrderRes.rows[0]?.max_order || 0;

      for (const prod of productsToAdd) {
        currentOrder += 1;
        const name = prod.name;
        const price = parseFloat(prod.price);
        const old_price = prod.old_price ? parseFloat(prod.old_price) : null;
        const category = prod.category || 'PEYNİR';
        const unit = prod.unit || 'kg';
        const unit_value = prod.unit_value ? parseFloat(prod.unit_value) : 1;
        const image_url = prod.image_url || '/default.png';

        const res = await query(
          'INSERT INTO products (name, price, old_price, image_url, category, unit, unit_value, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
          [name.trim(), price, old_price, image_url, category, unit, unit_value, currentOrder]
        );
        insertedProducts.push(res.rows[0]);
      }

      return NextResponse.json({ success: true, products: insertedProducts });
    }

    // TEK ÜRÜN EKLEME (FORM DATA)
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const old_price = formData.get('old_price') as string | null;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const unit_value = formData.get('unit_value') as string || '1';
    
    const image = formData.get('image') as File | null;
    let finalImageUrl = formData.get('image_url') as string || '/default.png';

    if (!name || !price) {
      return NextResponse.json({ error: 'İsim ve fiyat alanları zorunludur.' }, { status: 400 });
    }

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = image.name.split('.').pop();
      const filename = `product-${uniqueSuffix}.${extension}`;
      
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      
      finalImageUrl = `/uploads/${filename}`;
    }

    const parsedOldPrice = old_price ? parseFloat(old_price) : null;

    const maxOrderRes = await query('SELECT MAX(sort_order) as max_order FROM products');
    const nextOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;

    const res = await query(
      'INSERT INTO products (name, price, old_price, image_url, category, unit, unit_value, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name.trim(), parseFloat(price), parsedOldPrice, finalImageUrl, category || 'PEYNİR', unit || 'kg', parseFloat(unit_value), nextOrder]
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    console.error("Yükleme Hatası:", error);
    return NextResponse.json({ error: 'Ürün eklenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}

// 3. ÜRÜN GÜNCELLEME VE SIRALAMA (PUT)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (body.action === 'reorder' && Array.isArray(body.items)) {
        for (const item of body.items) {
          await query('UPDATE products SET sort_order = $1 WHERE id = $2', [
            parseInt(item.sort_order),
            parseInt(item.id)
          ]);
        }
        return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
      }
      if (body.action === 'toggle_active' && body.id !== undefined && body.is_active !== undefined) {
        const res = await query(
          'UPDATE products SET is_active = $1 WHERE id = $2 RETURNING *',
          [body.is_active, parseInt(body.id)]
        );
        if (res.rowCount === 0) {
          return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
        }
        return NextResponse.json({ success: true, product: res.rows[0] });
      }
      return NextResponse.json({ error: 'Geçersiz JSON isteği.' }, { status: 400 });
    }

    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const old_price = formData.get('old_price') as string | null;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const unit_value = formData.get('unit_value') as string || '1';
    
    const image = formData.get('image') as File | null;
    let finalImageUrl = formData.get('image_url') as string;

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    // 🧹 EKLENDİ: Önce ürünün mevcut eski resmini bulalım
    const oldProductRes = await query('SELECT image_url FROM products WHERE id = $1', [parseInt(id)]);
    const oldImageUrl = oldProductRes.rows[0]?.image_url;

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = image.name.split('.').pop();
      const filename = `product-${uniqueSuffix}.${extension}`;
      
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      finalImageUrl = `/uploads/${filename}`;

      // 🧹 EKLENDİ: Eğer yeni resim başarıyla yüklendiyse ve eski resim de sunucudaysa (uploads içindeyse) onu sil!
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        try {
          const oldPath = join(process.cwd(), 'public', oldImageUrl);
          await unlink(oldPath);
        } catch (e) {
          console.log("Eski resim silinemedi veya zaten yok:", e);
        }
      }
    }

    const parsedOldPrice = old_price ? parseFloat(old_price) : null;

    const res = await query(
      'UPDATE products SET name = $1, price = $2, old_price = $3, image_url = $4, category = $5, unit = $6, unit_value = $7 WHERE id = $8 RETURNING *',
      [name.trim(), parseFloat(price), parsedOldPrice, finalImageUrl, category || 'PEYNİR', unit || 'kg', parseFloat(unit_value), parseInt(id)]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Güncellenecek ürün bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    console.error("Güncelleme Hatası:", error);
    return NextResponse.json({ error: 'Ürün güncellenirken sunucu hatası oluştu.' }, { status: 500 });
  }
}

// 4. ÜRÜN SİLME (DELETE)
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Ürün ID bilgisi eksik.' }, { status: 400 });

    // 🧹 EKLENDİ: Ürünü tamamen silmeden önce resminin linkini alalım
    const productRes = await query('SELECT image_url FROM products WHERE id = $1', [parseInt(id)]);
    const imageUrl = productRes.rows[0]?.image_url;

    // Önce veritabanından ürünü siliyoruz
    await query('DELETE FROM products WHERE id = $1', [parseInt(id)]);

    // 🧹 EKLENDİ: Eğer ürünün resmi /uploads klasöründeyse, onu fiziksel diskten tamamen siliyoruz
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', imageUrl);
        await unlink(filePath);
      } catch (e) {
        console.log("Silinecek fiziksel resim dosyası bulunamadı:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}