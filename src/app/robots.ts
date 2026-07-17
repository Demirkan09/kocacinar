import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.kocacinarciftlik.com';

  return {
    rules: {
      userAgent: '*', // Tüm arama motoru botları için geçerli kurallar
      allow: '/',     // Sitenin genel olarak taranmasına izin ver
      disallow: [
        '/api/',      //  API rotalarımızı tarama, Google sonuçlarına çıkartma
        '/admin/',    //  Eğer varsa admin giriş yollarını gizle
        '/login',     //  Giriş sayfasını aramalardan uzak tut
        '/*.json$',   //  Next.js'in arka plandaki data dosyalarını tarama
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}