// src/app/components/AnnouncementBar.tsx
'use client';

const announcements = [
  " Türkiye'nin En Seçkin Şarküteri Lezzetleri",
  " 2000 TL ve Üzeri Alışverişlerde Ücretsiz Kargo",
  " %100 Doğal ve Katkısız Üretim Garantisi",
  " Taze ve Günlük Yöresel Ürünler",
  " Koca Çınar Güvencesiyle Sofranıza Doğallık"
];

export default function AnnouncementBar() {
  return (
    <div className="bg-[#000000] text-[#D4A373] py-2 text-[11px] md:text-xs overflow-hidden border-b border-[#D4A373]/20 uppercase tracking-[0.2em] font-bold">
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