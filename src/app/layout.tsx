import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Bileşenlerini buradan kendi doğru yollarına göre import et kanka
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import WhatsappButton from '@/app/components/WhatsappButton';

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
      <body className={inter.className}>
        {/* En üstte her zaman kayan yazı banyosu */}
        <AnnouncementBar />
        
        {/* Onun hemen altında ana navigasyon barı */}
        <Navbar />

        {/* Sayfa içerikleri buraya dinamik basılır (Login, Register, Profil vb.) */}
        <main>
          {children}
        </main>

        {/* Sağ altta sabit duran whatsapp butonu */}
        <WhatsappButton />
      </body>
    </html>
  );
}