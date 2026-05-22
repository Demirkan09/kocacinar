'use client';

const announcements = [
  "Türkiye'nin En Kaliteli Şarküteri Ürünleri",
  "2000 TL ve üzeri alışverişlerde kargo BEDAVA!",
  "Kalite Garantisi",
  "Taze ve Doğal Ürünler",
  "Tamamen Kendi Üretimimiz İle Doğal Ürünler"
];

export default function AnnouncementBar() {
  return (
    <div className="bg-[#000000] text-[#ffffff] py-2 text-sm overflow-hidden border-b border-[#5C4033]">
      <div className="flex items-center h-8">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
          {announcements.map((text, index) => (
            <span key={index} className="mx-8 font-medium">
              {text}
            </span>
          ))}
          {/* Tekrar için kopyalama (düzgün döngü için) */}
          {announcements.map((text, index) => (
            <span key={`copy-${index}`} className="mx-8 font-medium">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}