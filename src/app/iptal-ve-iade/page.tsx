import React from 'react';

export const metadata = {
  title: 'İptal ve İade Koşulları - Koca Çınar Şarküteri',
  description: 'Koca Çınar Şarküteri iptal, iade süreçleri ve taze/bozulabilir gıda maddelerinin cayma hakkı istisnaları bilgilendirmesi.',
};

export default function IptalVeIadePage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-[#D4A373]/10">
        
        {/* Üst Başlık */}
        <div className="text-center mb-12 border-b border-gray-100 pb-8">
          <span className="text-[#D4A373] font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Müşteri Hizmetleri</span>
          <h1 className="text-3xl md:text-4xl font-black text-[#5e0d0f] leading-tight">
            İPTAL VEYA İADE KOŞULLARI
          </h1>
          <div className="w-20 h-1 bg-[#D4A373] mx-auto rounded-full mt-4"></div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-8 text-gray-700 text-sm md:text-base leading-relaxed font-medium">
          
          {/* Madde 1: İptal */}
          <section className="bg-[#FBF9F4] p-6 rounded-2xl border border-[#D4A373]/10">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-3 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">1</span>
              İPTAL KOŞULLARI
            </h2>
            <p className="text-gray-600 pl-1">
              Siparişinizin iptal işlemlerini, siparişiniz kargoya teslim edilmeden önce gerçekleştirmeniz gerekmektedir. Sipariş durumunuz &quot;Kargoya Verildi&quot; aşamasına geçmeden önce <span className="text-[#5e0d0f] font-bold">kocacinarciftlik@gmail.com</span> adresine e-posta göndererek veya <span className="text-[#5e0d0f] font-bold">+90 551 340 48 48</span> numaralı WhatsApp destek hattımızdan bize ulaşarak iptal talebinizi iletebilirsiniz. İptal edilen siparişlerin ücret iadesi, ödemeyi yaptığınız İyzico altyapısı üzerinden aynı gün içinde bankanıza iletilir. Bankaların iadeyi kartınıza yansıtma süresi ortalama 1-3 iş günüdür.
            </p>
          </section>

          {/* Madde 2: Cayma Hakkı İstisnası (Kritik Alan) */}
          <section className="p-2 border-l-4 border-amber-500 pl-4 my-6">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-3 flex items-center gap-2">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">2</span>
              CAYMA HAKKI VE İSTİSNALARI (TAZE & BOZULABİLİR GIDA)
            </h2>
            <p className="text-gray-600 mb-3">
              Koca Çınar Şarküteri üzerinden satışı yapılan ürünlerin büyük bir kısmı taze gıda, şarküteri ürünleri (peynir, sucuk, zeytin, et ürünleri vb.) ve ısı değişimlerine karşı hassas organik ürünlerden oluşmaktadır.
            </p>
            <p className="text-gray-600 font-semibold bg-amber-50 p-4 rounded-xl text-xs md:text-sm border border-amber-200 leading-relaxed">
              ⚠️ 27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği&apos;nin &quot;Cayma Hakkı İstisnaları&quot; başlıklı 15. Maddesinin (c) bendi uyarınca; &quot;Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmelerde&quot; tüketicinin cayma hakkı bulunmamaktadır. Bu sebeple, soğuk zincir ile veya standart kargo ile gönderilen tüm taze şarküteri ürünleri, kahvaltılıklar ve ısıya duyarlı gıdalarda sağlık ve hijyen kuralları gereği sebepsiz yere iade veya değişim yapılamamaktadır.
            </p>
            <p className="text-gray-600 mt-3">
              Ambalajı açılmamış, vakumu bozulmamış ve soğuk zincir gerektirmeyen (örneğin kapalı kavanoz reçel, konserve, baharat gibi) dayanıklı kuru gıda ürünlerinde ise ürünü teslim aldığınız tarihten itibaren 14 (on dört) gün içinde cayma hakkınızı kullanarak iade talebinde bulunabilirsiniz. İade edilecek ürünün ticari vasfını yitirmemiş olması şarttır.
            </p>
          </section>

          {/* Madde 3: Hasarlı Ürün */}
          <section className="p-2">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">3</span>
              HASARLI, KUSURLU VEYA YANLIŞ ÜRÜN İADELERİ
            </h2>
            <p className="mb-4 text-gray-600">
              Müşteri memnuniyeti Koca Çınar Şarküteri için en büyük önceliktir. Siparişinizin kargo aşamasında hasar görmesi (kavanoz kırılması, vakum patlaması vb.) veya size yanlış/kusurlu ürün gönderilmesi durumunda aşağıdaki adımları izlemeniz gerekmektedir:
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 bg-[#FBF9F4] p-4 rounded-xl border border-gray-100">
                <span className="text-red-600 font-bold">📦</span>
                <span className="text-sm text-gray-600">Kargoyu teslim alırken pakette gözle görülür bir ezilme, akma veya yırtılma varsa kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturarak paketi teslim almayınız.</span>
              </div>
              <div className="flex gap-3 bg-[#FBF9F4] p-4 rounded-xl border border-gray-100">
                <span className="text-red-600 font-bold">📸</span>
                <span className="text-sm text-gray-600">Ürünü açtıktan sonra bir sorun (bozulma, vakum kaçağı, yanlış ürün) tespit ederseniz, ürünü teslim aldığınız gün içinde (24 saat içerisinde) ürünün fotoğraflarını çekerek <strong>+90 551 340 48 48</strong> numaralı WhatsApp hattımıza veya e-posta adresimize iletiniz.</span>
              </div>
              <div className="flex gap-3 bg-[#FBF9F4] p-4 rounded-xl border border-gray-100">
                <span className="text-green-600 font-bold">🛡️</span>
                <span className="text-sm text-gray-600">Şikayetiniz ekiplerimizce incelendikten sonra haklı bulunması durumunda, mağduriyetiniz yeni ürün gönderimi veya ücret iadesi yapılmak suretiyle derhal giderilecektir.</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}