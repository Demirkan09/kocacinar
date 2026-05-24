'use client';

import { CartProvider } from '@/app/components/cart';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components/Navbar';
import WhatsappButton from '@/app/components/WhatsappButton';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {/* En üstte her zaman kayan yazı */}
      <AnnouncementBar />
      
      {/* Ana navigasyon barı */}
      <Navbar />

      {/* Sayfa içerikleri */}
      <main>
        {children}
      </main>

      {/* Sağ altta sabit whatsapp butonu */}
      <WhatsappButton />
    </CartProvider>
  );
}