import React from 'react';

export const metadata = {
  title: 'Gizlilik Politikası ve KVKK - Koca Çınar Şarküteri',
  description: 'Koca Çınar Şarküteri Kişisel Verilerin Korunması Kanunu (KVKK) aydınlatma metni ve gizlilik politikası.',
};

export default function GizlilikVeKvkkPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-[#D4A373]/10">
        
        {/* Üst Başlık */}
        <div className="text-center mb-12 border-b border-gray-100 pb-8">
          <span className="text-[#D4A373] font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Yasal Bilgilendirme</span>
          <h1 className="text-3xl md:text-4xl font-black text-[#5e0d0f] leading-tight">
            GİZLİLİK POLİTİKASI VE KVKK AYDINLATMA METNİ
          </h1>
          <div className="w-20 h-1 bg-[#D4A373] mx-auto rounded-full mt-4"></div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-8 text-gray-700 text-sm md:text-base leading-relaxed font-medium">
          
          {/* Madde 1 */}
          <section className="bg-[#FBF9F4] p-6 rounded-2xl border border-[#D4A373]/10">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-3 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">1</span>
              TARAFLAR VE AMAÇ
            </h2>
            <p className="text-gray-600 pl-1">
              Bu Gizlilik Politikası ve KVKK Aydınlatma Metni, <a href="https://www.kocacinarciftlik.com" target="_blank" rel="noopener noreferrer" className="text-[#5e0d0f] font-bold underline">www.kocacinarciftlik.com</a> (bundan böyle &quot;Site&quot; olarak anılacaktır) üzerinden alışveriş yapan kullanıcıların (bundan böyle &quot;Kullanıcı&quot; veya &quot;Alıcı&quot; olarak anılacaktır) kişisel verilerinin Türkiye Cumhuriyeti 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında işlenmesine, korunmasına ve İyzico ödeme altyapısı ile olan veri akışına ilişkin koşulları belirlemek amacıyla **Koca Çınar Şarküteri** (bundan böyle &quot;Koca Çınar Şarküteri&quot; veya &quot;Veri Sorumlusu&quot; olarak anılacaktır) tarafından hazırlanmıştır.
            </p>
          </section>

          {/* Madde 2 */}
          <section className="p-2">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">2</span>
              İŞLENEN KİŞİSEL VERİLERİNİZ
            </h2>
            <p className="mb-4">Site üzerinden sipariş oluşturmanız veya üye olmanız durumunda aşağıdaki kişisel verileriniz işlenmektedir:</p>
            <ul className="space-y-3 pl-2">
              <li className="flex items-start gap-2"><span className="text-[#D4A373]">🔸</span> <strong>Kimlik Bilgileri:</strong> Ad, Soyad.</li>
              <li className="flex items-start gap-2"><span className="text-[#D4A373]">🔸</span> <strong>İletişim Bilgileri:</strong> E-posta adresi, telephone numarası, fatura ve teslimat adresi.</li>
              <li className="flex items-start gap-2"><span className="text-[#D4A373]">🔸</span> <strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, talep ve şikayet bilgileri, IP adresi.</li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4A373]">🔸</span> 
                <span>
                  <strong>Finansal Bilgiler:</strong> Koca Çınar Şarküteri, Alıcı&apos;ya ait kredi kartı veya banka kartı bilgilerini **kesinlikle kendi sunucularında veya veritabanında saklamaz.** Ödeme işlemleri, BDDK lisanslı ödeme kuruluşu olan **İyzico (İyzi Ödeme ve Elektronik Para Hizmetleri A.Ş.)** altyapısı üzerinden 256-bit SSL şifreleme yöntemiyle uçtan uca güvenli olarak gerçekleştirilir.
                </span>
              </li>
            </ul>
          </section>

          {/* Madde 3 */}
          <section className="p-2">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">3</span>
              KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
            </h2>
            <p className="mb-4">Toplanan kişisel verileriniz;</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Mesafeli Satış Sözleşmesi'nin kurulması ve ifası,",
                "Sipariş edilen ürünlerin kargo ile Alıcı'ya teslim edilebilmesi,",
                "Ödeme işlemlerinin İyzico altyapısı üzerinden güvenle doğrulanabilmesi ve fatura/fiş kesim işlemlerinin yapılabilmesi,",
                "Müşteri hizmetleri operasyonlarının yürütülmesi ve olası iptal/iade taleplerinin yönetilmesi,",
                "Yasal mevzuattan kaynaklanan bilgi saklama, raporlama ve bilgilendirme yükümlülüklerinin yerine getirilmesi"
              ].map((text, i) => (
                <div key={i} className="bg-[#FBF9F4] p-4 rounded-xl border border-gray-100 flex gap-3 items-start">
                  <span className="text-[#5e0d0f] font-bold">✓</span>
                  <span className="text-xs md:text-sm text-gray-600">{text} amaçlarıyla işlenmektedir.</span>
                </div>
              ))}
            </div>
          </section>

          {/* Madde 4 */}
          <section className="p-2">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">4</span>
              KİŞİSEL VERİLERİN AKTARILMASI VE PAYLAŞILMASI
            </h2>
            <p className="mb-4 text-gray-600">
              Koca Çınar Şarküteri, Kullanıcı verilerini 3. şahıslara satmaz veya ticari amaçla kiralayamaz. Ancak hizmetin ifası ve yasal zorunluluklar gereği verileriniz aşağıdaki kurumlarla paylaşılabilir:
            </p>
            <ul className="space-y-2.5 pl-2 text-gray-600">
              <li className="flex gap-2">▪ Ödeme tahsilatının yapılabilmesi amacıyla ödeme kuruluşu <strong>İyzico</strong> ile,</li>
              <li className="flex gap-2">▪ Siparişlerin fiziksel teslimatının sağlanabilmesi amacıyla anlaşmalı <strong>Kargo Şirketleri</strong> ile,</li>
              <li className="flex gap-2">▪ Fatura süreçlerinin yürütülebilmesi için anlaşmalı mali müşavir/muhasebe programları ile,</li>
              <li className="flex gap-2">▪ Hukuki uyuşmazlıklarda veya resmi kurumların usulüne uygun talepleri doğrultusunda yetkili adli ve idari merciler ile paylaşılabilmektedir.</li>
            </ul>
          </section>

          {/* Madde 5 */}
          <section className="bg-[#FBF9F4] p-6 rounded-2xl border border-[#D4A373]/10">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-3 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">5</span>
              ÇEREZLER (COOKIES)
            </h2>
            <p className="text-gray-600 pl-1">
              Site, Kullanıcı deneyimini iyileştirmek, sepet takibini yapmak ve oturum yönetimini sağlamak amacıyla tarayıcınızda çerezler (cookies) barındırabilir. Kullanıcılar diledikleri zaman tarayıcı ayarlarından çerezleri kapatma veya silme hakkına sahiptir. Çerezlerin kapatılması durumunda Site&apos;nin sepete ürün ekleme gibi temel fonksiyonları düzgün çalışmayabilir.
            </p>
          </section>

          {/* Madde 6 */}
          <section className="p-2">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">6</span>
              KVKK MADDE 11 KAPSAMINDAKİ HAKLARINIZ
            </h2>
            <p className="mb-4">Kullanıcılar, Veri Sorumlusu olan Koca Çınar Şarküteri&apos;ye başvurarak;</p>
            <div className="space-y-2 pl-2">
              {[
                "Kişisel verilerinin işlenip ifaden edilmediğini öğrenme,",
                "Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,",
                "Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,",
                "Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,",
                "Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme ve silinmesini talep etme"
              ].map((hak, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-[#D4A373]/20 text-[#5e0d0f] flex items-center justify-center font-bold text-xs">{index+1}</span>
                  <span className="text-sm text-gray-600 font-medium">{hak} haklarına sahiptir.</span>
                </div>
              ))}
            </div>
          </section>

          {/* Madde 7 */}
          <section className="border-t border-gray-100 pt-8 mt-4">
            <h2 className="text-lg font-extrabold text-[#5e0d0f] mb-4 flex items-center gap-2">
              <span className="bg-[#5e0d0f] text-white w-6 h-6 rounded-md flex items-center justify-center text-xs">7</span>
              İLETİŞİM BİLGİLERİ (VERİ SORUMLUSU)
            </h2>
            <p className="mb-4 text-gray-600">
              KVKK kapsamındaki haklarınızı kullanmak veya Gizlilik Politikası ile ilgili sorularınız için aşağıdaki iletişim kanallarından bizimle irtibata geçebilirsiniz.
            </p>
            
            {/* Kurumsal Kart Görünümü */}
            <div className="bg-gradient-to-br from-[#2A2020] to-[#3C2F2F] text-white p-6 rounded-3xl shadow-lg border border-[#D4A373]/30 max-w-md">
              <h3 className="text-xl font-extrabold text-[#D4A373] border-b border-white/10 pb-2 mb-4">Koca Çınar Şarküteri</h3>
              <div className="space-y-3 text-sm font-medium text-gray-200">
                <p><span className="text-[#D4A373] font-bold">📍 Adres:</span> Çeştepe Mahallesi, Barış Caddesi NO: 6/1, Aydın</p>
                <p><span className="text-[#D4A373] font-bold">✉ E-Posta:</span> kocacinarciftlik@gmail.com</p>
                <p><span className="text-[#D4A373] font-bold">📞 WhatsApp:</span> +90 551 340 48 48</p>
                <p><span className="text-[#D4A373] font-bold">🗂 Mersis No:</span> 2364431742600013</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}