import Image from 'next/image';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from "react-icons/hi2";
export default function Anasayfa() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F]">

      {/* Hero Section */}
      <section 
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center" 
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-bold text-[white] mb-6 tracking-wide">
            KOCA ÇINAR<br />ŞARKÜTERİ
          </h2>
          <p className="text-xl text-[white] mb-8 max-w-2xl mx-auto">
            En taze ve kaliteli şarküteri ürünleriyle hizmetinizdeyiz.
          </p>
          <a 
            href="/urunler" 
            className="inline-block bg-[#5e0d0f] hover:bg-[#C19A5B] text-[#ffffff] px-10 py-4 rounded-full text-lg font-semibold transition"
          >
            Ürünleri İncele
          </a>
        </div>
      </section>

      <footer className="bg-[#F2EBE3] text-[#D4A373] py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold">KOCA ÇINAR ŞARKÜTERİ</p>
          <p className="mt-2">Kalite ve Doğallık</p>
          <p className="mt-2 text-sm">© 2026 Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}