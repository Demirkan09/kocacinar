// src/app/components/AnnouncementBar.tsx
'use client';

import { useState, useEffect } from 'react';

const defaultAnnouncements = [
  " Türkiye'nin En Seçkin Şarküteri Lezzetleri",
  " 2000 TL ve Üzeri Alışverişlerde Ücretsiz Kargo",
  " %100 Doğal ve Katkısız Üretim Garantisi",
  " Taze ve Günlük Yöresel Ürünler",
  " Koca Çınar Güvencesiyle Sofranıza Doğallık"
];

export default function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnnouncements(data.map((item: any) => item.text));
            return;
          }
        }
      } catch (err) {
        console.error('Duyurular yüklenemedi:', err);
      }
      setAnnouncements(defaultAnnouncements);
    };
    fetchAnnouncements();
  }, []);

  // Sunucu tarafında render edilmesini engelleyerek hydration hatasını kökten çözüyoruz
  if (!mounted || announcements.length === 0) return null;

  return (
    <div 
      suppressHydrationWarning={true} // Doğru kullanım şekli etiket özelliğidir
      className="bg-[#000000] text-[#D4A373] py-2 text-[11px] md:text-xs overflow-hidden border-b border-[#D4A373]/20 uppercase tracking-[0.2em] font-bold"
    >
      <div className="flex items-center h-6">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 md:gap-24">
          {announcements.map((text, index) => (
            <span key={index} className="flex items-center gap-2">
              {text}
            </span>
          ))}
          {/* Kesintisiz döngü için kopya set */}
          {announcements.map((text, index) => (
            <span key={`copy-${index}`} className="flex items-center gap-2">
              {text}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}