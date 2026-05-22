import Image from 'next/image';
import AnnouncementBar from '../components/AnnouncementBar';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from "react-icons/hi2";
import Navbar from '../components/Navbar';
import WhatsAppButton from '../components/WhatsappButton';
export default function Urunler() {
  const products = [
    { id: 1, name: "Köy Peyniri", price: 185, category: "Peynir", unit: "kg" },
    { id: 2, name: "Taze Kaşar Peyniri", price: 245, category: "Peynir", unit: "kg" },
    { id: 3, name: "Ev Yapımı Sucuk", price: 320, category: "Et Ürünleri", unit: "kg" },
    { id: 4, name: "Özel Pastırma", price: 410, category: "Et Ürünleri", unit: "kg" },
    { id: 5, name: "Siyah Zeytin (Sele)", price: 95, category: "Zeytin", unit: "kg" },
    { id: 6, name: "Yeşil Zeytin", price: 110, category: "Zeytin", unit: "kg" },
    { id: 7, name: "Çam Balı", price: 280, category: "Bal & Reçel", unit: "kg" },
    { id: 8, name: "Tahin Pekmez", price: 135, category: "Bal & Reçel", unit: "kg" },
    { id: 9, name: "Kahvaltılık Zeytinyağı", price: 165, category: "Yağ", unit: "lt" },
    { id: 10, name: "Organik Yumurta", price: 85, category: "Yumurta", unit: "30'lu" },
  ];

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F]">
      <AnnouncementBar />
{/* Navbar */}
<Navbar />

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#5C4033]">Ürünlerimiz</h2>
            <p className="text-[#6B5B4A] mt-3 text-xl">50&apos;den fazla kaliteli ürün</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition group">
                <div className="h-56 bg-[#EDE4D4] flex items-center justify-center text-6xl border-b">
                  🧀
                </div>
                <div className="p-6">
                  <p className="text-sm uppercase tracking-widest text-[#8B6F47]">{product.category}</p>
                  <h4 className="font-semibold text-xl mt-2 mb-4">{product.name}</h4>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold text-[#5C4033]">{product.price}</span>
                      <span className="text-sm text-[#6B5B4A]"> ₺ / {product.unit}</span>
                    </div>
                    <a 
                      href="https://wa.me/905513404848" 
                      target="_blank"
                      className="bg-[#5C4033] hover:bg-[#3C2F2F] text-white px-5 py-2 rounded-xl text-sm transition"
                    >
                      Sipariş Ver
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#3C2F2F] text-[#D4A373] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold">KOCA ÇINAR ŞARKÜTERİ</p>
          <p className="mt-2">Kalite ve Doğallık</p>
          <p className="mt-8 text-sm">© 2026 Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </main>
  );
}