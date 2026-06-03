import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from "@/app/components/Footer"; // Yeni oluşturduğumuz footer
import Providers from '@/app/providers'; // Yeni oluşturacağımız dosya
import CookieBanner from '@/app/components/CookieBanner'; // 🌿 Yeni eklediğimiz çerez balonu

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Koca Çınar Şarküteri',
  description: 'Aydın Efeler’den sofralarınıza taze, katkısız ve yerli şarküteri ürünleri. Kahvaltıların vazgeçilmezleri gurme lezzetler soğuk zincirle kapınızda.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      {/* 1. ADIM: body'e tam ekran esneklik (flex) veriyoruz */}
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        {/* 2. ADIM: Tüm bileşenleri Providers içine alıyoruz ki içerideki state'lere erişebilsin */}
        <Providers>
          
          {/* 3. ADIM: children'ı flex-grow ile sarıyoruz ki sayfa boş bile olsa Footer'ı aşağı itsin */}
          <main className="flex-grow">
            {children}
          </main>
          
          {/* 🌿 4. ADIM: Premium Çerez Uyarı Baloncuğu */}
          <CookieBanner />
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}