// src/app/page.tsx
import Image from 'next/image';
import { HiOutlineSparkles, HiOutlineTruck, HiOutlineShieldCheck } from "react-icons/hi2";

export default function Anasayfa() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F] selection:bg-[#5e0d0f] selection:text-white">
      
      {/* HERO SECTION (Vitrin) */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Next.js Image ile optimize edilmiş arka plan - Hızlı yükleme için */}
        <Image 
          src="/hero.jpg" 
          alt="Koca Çınar Şarküteri Vitrin" 
          fill
          priority
          className="object-cover"
        />
        {/* Modern Gradient Overlay: Üstten alta hafifçe açılan siyahlık */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#F5F0E6]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-0">
          <span className="text-[#D4A373] font-bold tracking-[0.2em] text-sm md:text-base uppercase mb-4 block">
            Gelenekten Geleceğe Lezzet
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            KOCA ÇINAR <br className="hidden md:block" />
            <span className="text-[#D4A373]">ŞARKÜTERİ</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            En taze, en doğal ve birinci kalite şarküteri ürünleriyle sofralarınıza değer katıyoruz.
          </p>
          
          <a 
            href="/urunler" 
            className="group relative inline-flex items-center justify-center bg-[#5e0d0f] text-white px-8 py-4 md:px-12 md:py-5 rounded-full text-base md:text-lg font-semibold overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-[#5e0d0f]/30"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative">Ürünleri Keşfet</span>
          </a>
        </div>
      </section>

      {/* ÖZELLİKLER SECTION (Modern & Mobil Uyumlu Grid) */}
      <section className="relative z-20 -mt-16 md:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kart 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#D4A373]/20 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-full flex items-center justify-center text-[#5e0d0f] mb-4">
              <HiOutlineSparkles size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Günlük & Taze</h3>
            <p className="text-gray-600 text-sm">Ürünlerimiz her gün taze olarak özenle seçilir ve raflarımızda yerini alır.</p>
          </div>

          {/* Kart 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#D4A373]/20 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-full flex items-center justify-center text-[#5e0d0f] mb-4">
              <HiOutlineShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">1. Kalite Garantisi</h3>
            <p className="text-gray-600 text-sm">Katkısız, doğal ve yöresinden getirdiğimiz en seçkin lezzetler.</p>
          </div>

          {/* Kart 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#D4A373]/20 flex flex-col items-center text-center transform transition duration-300 hover:-translate-y-2 hover:shadow-xl">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-full flex items-center justify-center text-[#5e0d0f] mb-4">
              <HiOutlineTruck size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Hızlı Teslimat</h3>
            <p className="text-gray-600 text-sm">Siparişleriniz soğuk zincir bozulmadan kapınıza kadar güvenle ulaşır.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#2A2020] text-[#D4A373] py-16 border-t-[6px] border-[#5e0d0f]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-extrabold tracking-wider text-white mb-2">KOCA ÇINAR</h2>
            <p className="text-sm font-medium tracking-widest uppercase opacity-80">Şarküteri & Yöresel</p>
          </div>
          
          <div className="text-gray-400 text-sm flex flex-col items-center md:items-end">
            <p>Kalite ve Doğallığın Adresi.</p>
            <p className="mt-1">© {new Date().getFullYear()} Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
      
    </main>
  );
}