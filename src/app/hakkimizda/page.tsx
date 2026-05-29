// src/app/hakkimizda/page.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Hakkimizda() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Ürünleriniz tamamen doğal ve katkısız mı?",
      answer: "Evet. Tüm ürünlerimizde katkı maddesi, koruyucu, renklendirici ve aroma verici kullanmıyoruz. Sucuk, pastırma ve salamlarımız yalnızca et, tuz ve doğal baharatlarla üretilmektedir."
    },
    {
      question: "Soğuk zincir teslimatı nasıl sağlanıyor?",
      answer: "Siparişleriniz özel soğutuculu araçlarımızla paketlenir ve 0°C ile +4°C arasında muhafaza edilerek hızlı kargo firmaları aracılığıyla adresinize ulaştırılır. Buz aküsü ve termo ambalaj ile soğuk zincir kesintisiz korunur."
    },
    {
      question: "Siparişler ne kadar sürede teslim ediliyor?",
      answer: "Türkiye geneline siparişleriniz genellikle 1-3 iş günü içinde teslim edilir."
    },
    {
      question: "Kargo ücreti nedir? Ücretsiz kargo şartınız var mı?",
      answer: "2000 TL ve üzeri siparişlerde kargo ücretsizdir. 2000 TL altı siparişlerde kargo ücreti 75 TL’dir."
    },
    {
      question: "Ürünlerin raf ömrü ne kadardır?",
      answer: "Vakumlu ambalajda sucuk ve pastırmalarımız buzdolabında 45-60 gün, peynirlerimiz ise 30-45 gün dayanır. Açıldıktan sonra kısa sürede tüketmenizi öneririz."
    },
    {
      question: "İade ve değişim hakkı var mı?",
      answer: "Gıda ürünü olması nedeniyle hijyenik gerekçelerle açılmış veya tüketilmiş ürünlerde iade kabul edilmemektedir. Hasarlı veya bozuk ürün teslimatı durumunda ise 24 saat içinde iletişime geçmeniz halinde değişim yapılmaktadır."
    },
    {
      question: "Toptan satış yapıyor musunuz?",
      answer: "Evet, otel, restoran, market ve şubeler için toptan satışımız mevcuttur. Toptan alım için bizimle iletişime geçebilirsiniz."
    },
    {
      question: "Peynirleriniz pastörize midir?",
      answer: "Tüm peynirlerimiz yüksek ısıda pastörize edilerek üretilmektedir. Hem güvenlik hem de uzun raf ömrü için bu süreç zorunludur."
    },
    {
      question: "Sucuk ve pastırmalarınızda hangi baharatları kullanıyorsunuz?",
      answer: "Sadece doğal baharatlar kullanıyoruz: karabiber, kimyon, sarımsak, pul biber, yenibahar ve toz kırmızı biber. Hiçbir katkı veya hazır baharat karışımı kullanmıyoruz."
    },
    {
      question: "Kişisel verilerim güvende mi?",
      answer: "Tüm kişisel verileriniz 6698 sayılı KVKK kapsamında korunmaktadır. Bilgileriniz sadece sipariş süreçleri için kullanılır ve üçüncü kişilerle paylaşılmaz."
    }
  ];

  return (
    <main className="min-h-screen bg-[#F5F0E6] selection:bg-[#D4A373]">
      {/* Mevcut Hakkımızda İçeriği */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Görsel Alanı */}
            <div className="relative group">
              <div className="absolute -inset-4 border-2 border-[#D4A373]/30 rounded-[40px] transform group-hover:rotate-2 transition-transform duration-700"></div>
              <div className="relative h-[500px] md:h-[600px] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/about.jpeg"
                  alt="Hakkımızda"
                  fill
                  priority={true}
                  sizes="(max-width: 768px) 100vw, 50vw"
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

      {/* === SSS Bölümü === */}
      <section className="pb-24 px-6 bg-white/70">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#D4A373] font-bold tracking-[0.3em] uppercase text-sm">Sıkça Sorulan Sorular</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#5e0d0f] mt-3 font-serif">
              Aklınıza Takılanlar
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-[#D4A373]/30 rounded-2xl overflow-hidden bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-[#F5F0E6] transition-colors group"
                >
                  <span className="text-lg font-medium text-[#5e0d0f] pr-8">
                    {faq.question}
                  </span>
                  <span className={`text-3xl text-[#D4A373] transition-transform duration-300 ${openIndex === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-[400px]' : 'max-h-0'}`}>
                  <div className="px-8 pb-8 text-gray-700 leading-relaxed border-t border-[#D4A373]/10">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}