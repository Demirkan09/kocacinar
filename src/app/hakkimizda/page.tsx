import Image from 'next/image';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from "react-icons/hi2";
export default function Hakkimizda() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F]">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-4 text-[#3C2F2F]">Hakkımızda</h2>
          <p className="text-center text-[#6B5B4A] mb-16">Kalite ve Doğallık</p>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6 text-[#A67C5D]">Gelenekten Geleceğe</h3>
              <p className="text-lg leading-relaxed">
                Koca Çınar Şarküteri olarak kendi üremimimiz olan en kaliteli peynir, sucuk, pastırma, 
                zeytin, bal, reçel ve diğer organik ürünlerimizi siz değerli müşterilerimize sunuyoruz.
              </p>
              <p className="mt-6 text-lg leading-relaxed">
                Her ürünümüz özenle ve doğal yöntemlerle üretilir ve taze olarak reyonlarımıza ulaşır. 
                Müşterilerimizin memnuniyeti bizim için her zaman önceliklidir.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image 
                src="/about.jpg" 
                alt="Koca Çınar Şarküteri" 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-[#3C2F2F] text-[#D4A373] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold">KOCA ÇINAR ŞARKÜTERİ</p>
          <p className="mt-8 text-sm">© 2026 Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}