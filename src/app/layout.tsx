import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from "@/app/components/Footer"; // Yeni oluşturduğumuz footer
import Providers from '@/app/providers'; // Yeni oluşturacağımız dosya

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Koca Çınar Şarküteri',
  description: 'Taze ve Doğal Lezzetler',
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
        {/* 2. ADIM: Footer'ı Providers içine alıyoruz ki içerideki state'lere erişebilsin */}
        <Providers>
          
          {/* 3. ADIM: children'ı flex-grow ile sarıyoruz ki sayfa boş bile olsa Footer'ı aşağı itsin */}
          <main className="flex-grow">
            {children}
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}