// src/app/iletisim/page.tsx
export default function Iletisim() {
  return (
    <main className="min-h-screen bg-[#F5F0E6] py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold text-[#5e0d0f] mb-6">Bize Ulaşın</h2>
        <p className="text-gray-600 mb-12">Lezzet yolculuğumuz hakkında sorularınız için her zaman buradayız.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* İletişim Kartı */}
          <div className="bg-white/80 backdrop-blur-md p-10 rounded-[40px] shadow-sm border border-white hover:shadow-xl transition-all text-left">
            <div className="space-y-10">
              <div className="flex gap-4">
                <span className="text-3xl">📍</span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">Adresimiz</p>
                  <p className="text-gray-700">Koca Çınar Şarküteri, <br />Çeştepe Mahallesi, Barış Caddesi NO: 6/1</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-3xl">📞</span>
                <div>
                  <p className="font-bold text-[#5e0d0f] uppercase text-xs tracking-widest mb-1">Telefon</p>
                  <a href="tel:+905513404848" className="text-xl text-[#000000] font-bold hover:text-[#D4A373] transition">+90 551 340 48 48</a>
                </div>
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="bg-[#5e0d0f] p-10 rounded-[40px] text-white text-left shadow-2xl flex flex-col justify-between">
            <h4 className="text-2xl font-bold italic mb-6">Açık Olduğumuz <br /> Saatler</h4>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Hafta İçi</span>
                <span className="font-bold">09:00 - 22:00</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span>Hafta Sonu</span>
                <span className="font-bold">09:00 - 22:00</span>
              </div>
            </div>
            <a href="https://wa.me/905513404848" className="mt-8 w-full bg-[#D4A373] text-[#5e0d0f] font-bold py-4 rounded-2xl text-center hover:bg-white transition-all shadow-lg">
               WhatsApp Sipariş Hattı
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}