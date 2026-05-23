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
    const res = await query('SELECT * FROM products ORDER BY id DESC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. YENİ ÜRÜN EKLEME (POST) - Dosya Yükleme Destekli
export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const imageUrlInput = formData.get('image_url') as string;
    const file = formData.get('file') as File | null;

    if (!name || !price) {
      return NextResponse.json({ error: 'İsim ve fiyat alanları zorunludur.' }, { status: 400 });
    }

    let finalImageUrl = imageUrlInput || '/about.jpg';

    // Eğer bilgisayardan dosya seçildiyse VDS'e kaydet
    if (file && file.size > 0 && file.name !== 'undefined') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // public/uploads klasör yolunu oluştur
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Benzersiz dosya ismi üret
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, uniqueFileName);
      
      // Dosyayı diske yaz
      await writeFile(filePath, buffer);
      finalImageUrl = `/uploads/${uniqueFileName}`;
    }

    const res = await query(
      'INSERT INTO products (name, price, image_url, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, parseFloat(price), finalImageUrl, category || 'PEYNİR']
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. ÜRÜN GÜNCELLEME (PUT) - ESKİ FOTOYU DA SİLER
export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const imageUrlInput = formData.get('image_url') as string;
    const file = formData.get('file') as File | null;

    if (!id || !name || !price) {
      return NextResponse.json({ error: 'Eksik bilgi gönderildi.' }, { status: 400 });
    }

    let finalImageUrl = imageUrlInput;

    // Eğer yeni bir dosya yükleniyorsa
    if (file && file.size > 0 && file.name !== 'undefined') {
      
      // 1. Önce eski görseli bulup silelim (eğer varsa ve uploads klasöründeyse)
      const oldProductRes = await query('SELECT image_url FROM products WHERE id = $1', [id]);
      const oldImageUrl = oldProductRes.rows[0]?.image_url;
      
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        const oldFilePath = join(process.cwd(), 'public', oldImageUrl);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);
          console.log(`🗑️ Eski fotoğraf sunucudan temizlendi: ${oldFilePath}`);
        }
      }

      // 2. Yeni dosyayı kaydedelim
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      
      const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, uniqueFileName);
      
      await writeFile(filePath, buffer);
      finalImageUrl = `/uploads/${uniqueFileName}`;
    }

    // 3. Veritabanını güncelleyelim
    const res = await query(
      'UPDATE products SET name = $1, price = $2, image_url = $3, category = $4 WHERE id = $5 RETURNING *',
      [name, parseFloat(price), finalImageUrl, category || 'PEYNİR', id]
    );

    return NextResponse.json({ success: true, product: res.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. ÜRÜN SİLME (DELETE) - HEM VERİTABANINDAN HEM DİSKTEN SİLER
export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Yönetici yetkisi gerekiyor.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Ürün ID bilgisi eksik.' }, { status: 400 });
    }

    // Önce silinecek ürünün görsel yolunu veritabanından öğrenelim kanka
    const productRes = await query('SELECT image_url FROM products WHERE id = $1', [id]);
    
    if (productRes.rows.length > 0) {
      const imageUrl = productRes.rows[0].image_url;

      // Eğer görsel bizim sunucuya yüklediğimiz (/uploads/ ile başlayan) bir dosya ise silelim
      if (imageUrl && imageUrl.startsWith('/uploads/')) {
        // public klasörünün içindeki dosya yolunu tam buluyoruz
        const filePath = join(process.cwd(), 'public', imageUrl);
        
        try {
          // Dosya gerçekten diskte var mı kontrol et, varsa yok et kanka
          if (existsSync(filePath)) {
            await unlink(filePath);
          }
        } catch (fileErr) {
          console.error("Fotoğraf dosyası silinirken hata çıktı (Sistem engellemiş olabilir):", fileErr);
          // Fotoğraf silinemese bile ürünün db'den silinmesini engellememek için işleme devam ediyoruz
        }
      }
    }

    // Şimdi ürünü veritabanından tamamen silebiliriz
    await query('DELETE FROM products WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Ürün ve bağlı görsel başarıyla silindi.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}