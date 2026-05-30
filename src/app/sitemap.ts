import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.kocacinarciftlik.com'; // Kendi tam canlı domainini yaz kanka

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
    // Kendi iç API'mizden veya direkt DB query'den ürünleri çekiyoruz
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const products = Array.isArray(data) ? data : data.rows || data.products || [];
      
      productRoutes = products.map((product: any) => ({
        url: `${baseUrl}/urunler?id=${product.id}`, // Ürün detay link yapın nasılsa ona göre esnetebilirsin
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