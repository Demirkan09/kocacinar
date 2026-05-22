import WhatsAppButton from '../components/WhatsappButton';
import AnnouncementBar from '../components/AnnouncementBar';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from "react-icons/hi2";
import Navbar from '../components/Navbar';
export default function Iletisim() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F]">
      <AnnouncementBar />
{/* Navbar */}
<Navbar />

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">İletişime Geçin</h2>
          <p className="text-xl text-[#6B5B4A] mb-12">Sorularınız ve siparişleriniz için bize ulaşabilirsiniz.</p>

          <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto">
            <div className="space-y-8 text-left">
              <div>
                <p className="font-medium text-lg">📍 Adres</p>
                <p className="mt-2">Koca Çınar Şarküteri<br />[Adresinizi buraya yazınız]</p>
              </div>
              <div>
                <p className="font-medium text-lg">☎️ Telefon</p>
                <a href="tel:+905513404848" className="text-2xl font-semibold hover:text-[#A67C5D] transition">
                  +90 551 340 48 48
                </a>
              </div>
              <div>
                <p className="font-medium text-lg">✉️ E-posta</p>
                <p>kocacinarciftlik@gmail.com</p>
              </div>
              <div>
                <p className="font-medium text-lg">Çalışma Saatleri</p>
                <p>Hafta İçi: 08:00 - 20:00<br />Hafta Sonu: 08:30 - 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#3C2F2F] text-[#D4A373] py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold">KOCA ÇINAR ŞARKÜTERİ</p>
          <p className="mt-8 text-sm">© 2026 Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>
      </footer>

      <WhatsAppButton />
    </main>
  );
}