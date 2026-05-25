import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
    const res = await query('SELECT * FROM products ORDER BY sort_order ASC, id DESC');
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
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const oldPrice = formData.get('old_price') as string; 
    const category = formData.get('category') as string;
    const imageUrlInput = formData.get('image_url') as string;
    const unit = formData.get('unit') as string; // ✅ Birim bilgisini yakalıyoruz
    const file = formData.get('file') as File | null;
    
    if (!name || !price) {
      return NextResponse.json({ error: 'İsim ve fiyat alanları zorunludur.' }, { status: 400 });
    }

    let finalImageUrl = imageUrlInput || '/about.jpg';
    const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : null;

    if (file && file.size > 0 && file.name !== 'undefined') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);
      finalImageUrl = `/uploads/${uniqueFileName}`;
    }

    // ✅ unit SÜTUNU SQL SORGUSUNA VE PARAMETRELERİNE EKLENDİ
    const res = await query(
      'INSERT INTO products (name, price, old_price, image_url, category, unit, sort_order) VALUES ($1, $2, $3, $4, $5, $6, 0) RETURNING *',
      [name, parseFloat(price), parsedOldPrice, finalImageUrl, category || 'PEYNİR', unit || 'kg']
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ÜRÜN GÜNCELLEME (PUT)
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    try {
      const body = await request.json();
      if (body.action === 'reorder') {
        for (const item of body.items) {
          await query('UPDATE products SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
        }
        return NextResponse.json({ success: true, message: 'Sıralama güncellendi.' });
      }
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const oldPrice = formData.get('old_price') as string;
    const category = formData.get('category') as string;
    const imageUrlInput = formData.get('image_url') as string;
    const unit = formData.get('unit') as string; // ✅ Birim bilgisini yakalıyoruz
    const file = formData.get('file') as File | null;

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    let finalImageUrl = imageUrlInput;
    const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : null;

    if (file && file.size > 0 && file.name !== 'undefined') {
      const oldProductRes = await query('SELECT image_url FROM products WHERE id = $1', [id]);
      const oldImageUrl = oldProductRes.rows[0]?.image_url;
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        const oldFilePath = join(process.cwd(), 'public', oldImageUrl);
        if (existsSync(oldFilePath)) await unlink(oldFilePath);
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, uniqueFileName);
      await writeFile(filePath, buffer);
      finalImageUrl = `/uploads/${uniqueFileName}`;
    }

    // ✅ unit SÜTUNU UPDATE SQL SORGUSUNA VE PARAMETRELERİNE EKLENDİ
    const res = await query(
      'UPDATE products SET name = $1, price = $2, old_price = $3, image_url = $4, category = $5, unit = $6 WHERE id = $7 RETURNING *',
      [name, parseFloat(price), parsedOldPrice, finalImageUrl, category || 'PEYNİR', unit || 'kg', id]
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const productRes = await query('SELECT image_url FROM products WHERE id = $1', [id]);
    if (productRes.rows.length > 0) {
      const imageUrl = productRes.rows[0].image_url;
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const filePath = join(process.cwd(), 'public', imageUrl);
        try { if (existsSync(filePath)) await unlink(filePath); } catch {}
      }
    }

    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}