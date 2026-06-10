'use client';
import { 
  HiOutlineMapPin, 
  HiOutlinePhone, 
  HiOutlineEnvelope 
} from "react-icons/hi2";
import { FaWhatsapp, FaInstagram } from 'react-icons/fa6';

export default function Iletisim() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-[#5e0d0f] mb-6">Bize Ulaşın</h2>
        <p className="text-gray-600 mb-12">Lezzet yolculuğumuz hakkında sorularınız için her zaman buradayız.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* İletişim Kartı */}
          <div className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] shadow-sm border border-white hover:shadow-xl transition-all text-left">
            <div className="space-y-8">
              {/* Adres */}
              <div className="flex gap-4 items-start">
                <span className="text-2xl p-3 bg-[#F5F0E6] text-[#5e0d0f] rounded-2xl">
                  <HiOutlineMapPin />
                </span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">Adresimiz</p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Koca Çınar Şarküteri, <br />
                    Çeştepe Mahallesi, Barış Caddesi NO: 6/1 <br />
                    Aydın / Merkez
                  </p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex gap-4 items-center">
                <span className="text-2xl p-3 bg-[#F5F0E6] text-[#5e0d0f] rounded-2xl">
                  <HiOutlinePhone />
                </span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">Telefon</p>
                  <a href="tel:+905513404848" className="text-lg text-[#3C2F2F] font-bold hover:text-[#D4A373] transition">
                    +90 551 340 48 48
                  </a>
                </div>
              </div>

              {/* E-Posta */}
              <div className="flex gap-4 items-center">
                <span className="text-2xl p-3 bg-[#F5F0E6] text-[#5e0d0f] rounded-2xl">
                  <HiOutlineEnvelope />
                </span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">E-Posta</p>
                  <a href="mailto:kocacinarciftlik@gmail.com" className="text-base text-[#3C2F2F] font-semibold hover:text-[#D4A373] transition">
                    kocacinarciftlik@gmail.com
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex gap-4 items-center pt-2 border-t border-gray-100">
                <span className="text-2xl p-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-2xl shadow-sm">
                  <FaInstagram />
                </span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">Sosyal Medya</p>
                  <a 
                    href="https://www.instagram.com/kocacinarcifligi?igsh=bm5rdtnpegswexkw" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-base text-[#3C2F2F] font-bold hover:text-[#ee2a7b] transition block"
                  >
                    @kocacinarcifligi
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri & WhatsApp */}
          <div className="bg-[#5e0d0f] p-10 rounded-[40px] text-white text-left shadow-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-2xl font-bold italic mb-6 leading-snug">Açık Olduğumuz <br /> Saatler</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                  <span className="text-gray-300">Hafta İçi</span>
                  <span className="font-bold tracking-wide">09:00 - 22:00</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2 text-sm">
                  <span className="text-gray-300">Hafta Sonu</span>
                  <span className="font-bold tracking-wide">09:00 - 22:00</span>
                </div>
              </div>
            </div>

            {/* Kusursuz WhatsApp Butonu */}
            <a 
              href="https://wa.me/905513404848" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99]"
            >
              <FaWhatsapp className="text-xl" />
              <span>WhatsApp Sipariş Hattı</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}