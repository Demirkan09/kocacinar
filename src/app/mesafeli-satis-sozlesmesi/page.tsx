import React from 'react';

export const metadata = {
  title: 'Mesafeli Satış Sözleşmesi - Koca Çınar Şarküteri',
  description: 'Koca Çınar Şarküteri internet sitesi üzerinden yapılan alışverişlerin yasal mesafeli satış sözleşmesi şartları.',
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-[#D4A373]/10">
        
        {/* Üst Başlık */}
        <div className="text-center mb-12 border-b border-gray-100 pb-8">
          <span className="text-[#D4A373] font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Hukuki Metinler</span>
          <h1 className="text-3xl md:text-4xl font-black text-[#5e0d0f] leading-tight">
            MESAFELİ SATIŞ SÖZLEŞMESSİ
          </h1>
          <div className="w-20 h-1 bg-[#D4A373] mx-auto rounded-full mt-4"></div>
        </div>

        {/* Metin İçeriği */}
        <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed font-medium">
          
          {/* Madde 1 */}
          <section className="bg-[#FBF9F4] p-5 rounded-xl border border-gray-100">
            <h3 className="font-extrabold text-[#5e0d0f] uppercase mb-2">MADDE 1 - TARAFLAR</h3>
            <div className="space-y-3 pl-1 text-gray-600 text-xs md:text-sm">
              <p><strong>1.1. SATICI:</strong></p>
              <p>Unvanı: Koca Çınar Şarküteri</p>
              <p>Adresi: Çeştepe Mahallesi, Barış Caddesi NO: 6/1, Aydın</p>
              <p>Web: www.kocacinarciftlik.com</p>
              <p>E-Posta: kocacinarciftlik@gmail.com | Tel: +90 551 340 48 48</p>
              <p className="mt-2 border-t border-gray-200/60 pt-2"><strong>1.2. ALICI (Tüketici):</strong></p>
              <p>Sipariş esnasında internet sitesinde fatura ve teslimat bilgilerini girerek onaylayan son kullanıcı.</p>
            </div>
          </section>

          {/* Madde 2 */}
          <section className="p-1">
            <h3 className="font-extrabold text-[#5e0d0f] uppercase mb-2">MADDE 2 - KONU</h3>
            <p className="text-gray-600 text-xs md:text-sm pl-1">
              İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait www.kocacinarciftlik.com internet sitesinden elektronik ortamda siparişini yaptığı, sitede nitelikleri ve satış fiyatı belirtilen ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
            </p>
          </section>

          {/* Madde 3 */}
          <section className="p-1">
            <h3 className="font-extrabold text-[#5e0d0f] uppercase mb-2">MADDE 3 - SÖZLEŞME KONUSU ÜRÜN, ÖDEME VE TESLİMAT</h3>
            <p className="text-gray-600 text-xs md:text-sm pl-1">
              Sözleşme konusu ürünlerin cinsi, miktarı, satış bedeli, ödeme şekli ve teslimat bilgileri ALICI tarafından sepet sayfasında onaylandığı gibidir. Ödeme işlemleri BDDK onaylı İyzico altyapısı ile güvence altına alınmış olup, SATICI, ALICI&apos;ya ait kredi kartı bilgilerini hiçbir şekilde kayıt altında tutmaz ve göremez.
            </p>
          </section>

          {/* Madde 4 */}
          <section className="p-1">
            <h3 className="font-extrabold text-[#5e0d0f] uppercase mb-2">MADDE 4 - GENEL HÜKÜMLER</h3>
            <div className="space-y-2 text-gray-600 text-xs md:text-sm pl-1">
              <p><strong>4.1.</strong> ALICI, internet sitesinde sözleşme konusu ürünün temel nitelikleri, tüm vergiler dahil satış fiyatı ve ödeme şekline ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.</p>
              <p><strong>4.2.</strong> Ürün, yasal 30 günlük süreyi aşmamak koşulu ile ALICI&apos;nın yerleşim yerinin uzaklığına bağlı olarak kargo firması aracılığıyla ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir.</p>
              <p><strong>4.3.</strong> Ürünün teslimatı anında, ALICI adresinde bulunmasa dahi kargo şirketine teslim edilmiş ürün, ALICI&apos;ya teslim edilmiş sayılacaktır. Bu nedenle ALICI&apos;nın kargosunu geç teslim almasından kaynaklı gıda bozulmalarından SATICI sorumlu tutulamaz.</p>
            </div>
          </section>

          {/* Madde 5 */}
          <section className="p-1 bg-red-50/50 p-4 rounded-xl border border-red-100">
            <h3 className="font-extrabold text-red-900 uppercase mb-2">MADDE 5 - CAYMA HAKKI VE İADE EDİLEMEYECEK ÜRÜNLER</h3>
            <div className="space-y-2 text-red-800 text-xs md:text-sm pl-1">
              <p><strong>5.1.</strong> SATICI&apos;nın internet sitesi üzerinden sattığı ürünlerin genel itibariyle taze gıda, şarküteri ve çabuk bozulabilen mallar olması hasebiyle; Mesafeli Sözleşmeler Yönetmeliği Madde 15/1-c gereğince <strong>ALICI&apos;nın cayma (sebepsiz iade) hakkı bulunmamaktadır.</strong> Soğuk zincir gıda ürünleri, peynir, zeytin, sucuk ve kahvaltılıklar hiçbir koşulda sebepsiz yere iade alınmaz.</p>
              <p><strong>5.2.</strong> Bozulma riski taşımayan, vakumlu ambalajı veya koruyucu bandı açılmamış kuru gıda veya kavanoz ambalajlı ürünlerde ise ALICI, ürünü teslim aldığı tarihten itibaren 14 gün içinde hiçbir gerekçe göstermeksizin kargo ücretini karşılayarak iade hakkını kullanabilir.</p>
            </div>
          </section>

          {/* Madde 6 */}
          <section className="p-1">
            <h3 className="font-extrabold text-[#5e0d0f] uppercase mb-2">MADDE 6 - YETKİLİ MAHKEME</h3>
            <p className="text-gray-600 text-xs md:text-sm pl-1">
              İşbu sözleşmenin uygulanmasında ve çıkabilecek ihtilaflarda, Ticaret Bakanlığı&apos;nce her yıl ilan edilen parasal sınırlara kadar ALICI&apos;nın mal veya hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetleri; söz konusu değeri aşan durumlarda ise Tüketici Mahkemeleri yetkilidir.
            </p>
            <p className="text-[#5e0d0f] font-bold text-xs mt-4 border-t border-gray-100 pt-4 text-center uppercase tracking-wide">
              ALICI, www.kocacinarciftlik.com üzerinden sipariş oluşturduğunda işbu sözleşmenin tüm şartlarını kabul etmiş sayılır.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}