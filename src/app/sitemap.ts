import { MetadataRoute } from 'next';

// 🚀 Next.js'e bu rotanın statikleştirilmemesini, her istek geldiğinde canlı çalışmasını söylüyoruz
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kocacinarciftlik.com'; // Kendi canlı domainin

  // Sabit Kurumsal Sayfalar
  const routes = [
    '',
    '/urunler',
    '/sepet',
    '/gizlilik-ve-kvkk',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Veritabanındaki ürünleri dinamik çekip sitemap'e besliyoruz
  let productRoutes: any[] = [];
  try {
    // 🛠️ next: { revalidate: 0 } ekleyerek çakışmayı Next.js standartlarında çözüyoruz
    const res = await fetch(`${baseUrl}/api/products`, { 
      next: { revalidate: 0 } 
    });
    
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data) ? data : data.rows || data.products || [];
      
      productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/urunler?id=${product.id}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Sitemap dinamik ürün çekme hatası:', error);
  }

  return [...routes, ...productRoutes];
}