// src/app/hakkimizda/page.tsx
import Image from 'next/image';

export default function Hakkimizda() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] selection:bg-[#D4A373]">
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Görsel Alanı - Premium Çerçeve */}
            <div className="relative group">
              <div className="absolute -inset-4 border-2 border-[#D4A373]/30 rounded-[40px] transform group-hover:rotate-2 transition-transform duration-700"></div>
              <div className="relative h-[500px] md:h-[600px] rounded-[32px] overflow-hidden shadow-2xl">
<Image
  src="/about.jpeg"
  alt="Hakkımızda"
  fill
  priority={true} // 👈 LCP uyarısını çözer (Resmi öncelikli yükler)
  sizes="(max-width: 768px) 100vw, 50vw" // 👈 Slayt/Boyut uyarısını çözer
  className="object-cover"
/>
              </div>
            </div>

            {/* Metin Alanı */}
            <div className="flex flex-col gap-8">
              <span className="text-[#D4A373] font-bold tracking-[0.3em] uppercase text-sm">Bizim Hikayemiz</span>
              <h2 className="text-5xl md:text-7xl font-bold text-[#5e0d0f] leading-tight font-serif italic">
                Doğallığın <br /> En Saf Hali
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed font-light">
                <strong className="text-[#5e0d0f]">Koca Çınar Şarküteri</strong> olarak, her bir lokmada memleketimizin bereketli topraklarının kokusunu hissettirmeyi amaçlıyoruz. Kendi üretimimiz olan peynirlerden, yöresinden seçilen zeytinlere kadar her şey "gerçek gıda" prensibimizle sofranıza ulaşır.
              </p>
              
              <div className="grid grid-cols-2 gap-8 py-8 border-t border-[#D4A373]/20">
                <div>
                  <h4 className="text-3xl font-bold text-[#5e0d0f]">Katkısız</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Üretim Garantisi</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-[#5e0d0f]">%100</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Doğal Üretim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}