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
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}