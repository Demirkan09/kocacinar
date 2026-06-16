import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

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
    const contentType = request.headers.get('content-type') || '';
    let category_name = '';
    let image_url = '';
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      category_name = formData.get('category_name') as string;
      image_url = formData.get('image_url') as string || '';
      imageFile = formData.get('image') as File | null;
    } else {
      const body = await request.json();
      category_name = body.category_name;
      image_url = body.image_url || '';
    }

    if (!category_name) {
      return NextResponse.json({ error: 'Kategori adı zorunlu' }, { status: 400 });
    }

    // Mevcut eski resmi veritabanından sorgulayalım
    const oldProductRes = await query(
      'SELECT image_url FROM category_images WHERE UPPER(category_name) = UPPER($1)',
      [category_name.trim()]
    );
    const oldImageUrl = oldProductRes.rows[0]?.image_url;

    // EĞER SİLME VEYA TEMİZLEME İSE (Hem dosya hem url yoksa)
    if (!imageFile && !image_url) {
      await query('DELETE FROM category_images WHERE UPPER(category_name) = UPPER($1)', [category_name.trim()]);
      
      // Eski fiziksel resmi diskten sil
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        try {
          const oldPath = join(process.cwd(), 'public', oldImageUrl);
          await unlink(oldPath);
        } catch (e) {
          console.log("Eski resim silinemedi veya zaten yok:", e);
        }
      }
      return NextResponse.json({ success: true, message: 'Görsel kaldırıldı.' });
    }

    let finalImageUrl = image_url;

    // EĞER YENİ DOSYA YÜKLENİYORSA
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = imageFile.name.split('.').pop();
      const filename = `category-${uniqueSuffix}.${extension}`;
      
      const path = join(process.cwd(), 'public', 'uploads', filename);
      await writeFile(path, buffer);
      
      finalImageUrl = `/uploads/${filename}`;

      // Eski fiziksel resmi diskten sil
      if (oldImageUrl && oldImageUrl.startsWith('/uploads/')) {
        try {
          const oldPath = join(process.cwd(), 'public', oldImageUrl);
          await unlink(oldPath);
        } catch (e) {
          console.log("Eski resim silinemedi:", e);
        }
      }
    } else if (oldImageUrl && oldImageUrl !== image_url && oldImageUrl.startsWith('/uploads/')) {
      // Eğer dosya yüklenmedi ama sadece URL girildi/değiştirildi ise ve eski resim fiziksel ise sil
      try {
        const oldPath = join(process.cwd(), 'public', oldImageUrl);
        await unlink(oldPath);
      } catch (e) {
        console.log("Eski resim silinemedi:", e);
      }
    }

    // Varsa güncelle, yoksa yeni ekle (UPSERT)
    const res = await query(
      `INSERT INTO category_images (category_name, image_url) 
       VALUES (UPPER($1), $2) 
       ON CONFLICT (category_name) 
       DO UPDATE SET image_url = EXCLUDED.image_url 
       RETURNING *`,
      [category_name.trim(), finalImageUrl]
    );

    return NextResponse.json({ success: true, data: res.rows[0] });
  } catch (error: any) {
    console.error("Kategori resmi kaydetme hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}