'use client';
import { useCart } from '@/app/components/cart';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function SepetPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  
  // Toplam sepet tutarını hesaplama
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 75; // 2000 TL üzeri kargo bedava kuralı 
  const totalAmount = subtotal + shippingFee;

  // Ödeme yapacak müşterinin bilgileri için state yapısı
  const [buyerInfo, setBuyerInfo] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: 'Aydın', // Varsayılan Şehir
    email: ''
  });

  // İşlem durumlarını kontrol eden state tanımlamaları
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedId = e.target.value;
  const selected = savedAddresses.find(a => a.id === selectedId);
  if (selected) {
    setBuyerInfo(prev => ({
      ...prev,
      address: `${selected.detail || ''} ${selected.district || ''} / ${selected.city || ''}`,
      city: selected.city || 'Aydın'
    }));
  }
};
  // Sipariş listesini WhatsApp hattına iletme fonksiyonu
  const handleWhatsAppCheckout = () => {
    let message = `*Koca Çınar Şarküteri - Yeni Sipariş*\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}) *${item.name}* - ${item.quantity} ${item.unit || 'kg'} x ₺${item.price} \n`;
    });
    message += `\n-------------------------\n`;
    message += `*Ara Toplam:* ₺${subtotal}\n`;
    message += `*Kargo:* ${shippingFee === 0 ? 'Ücretsiz' : `₺${shippingFee}`}\n`;
    message += `*Toplam Tutar:* *₺${totalAmount}*\n\n`;
    message += `Merhaba, bu ürünleri sipariş etmek istiyorum.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/905513404848?text=${encodedMessage}`, '_blank');
  };
  
  // Online ödeme sayfasına yönlendirme fonksiyonu
  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zorunlu alanların kontrolü
    if (!buyerInfo.first_name || !buyerInfo.last_name || !buyerInfo.phone || !buyerInfo.address || !buyerInfo.email) {
      alert('Lütfen online ödeme işleminin tamamlanabilmesi için teslimat ve iletişim bilgilerinizi eksiksiz doldurunuz.');
      return;
    }

    if (cart.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          totalPrice: totalAmount,
          shippingFee: shippingFee,
          buyerInfo: buyerInfo
        })
      });

      const data = await res.json();

      if (data.status === 'success' && data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
      } else {
        alert(`Ödeme başlatılamadı: ${data.errorMessage || 'Bilinmeyen hata'}`);
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Ödeme hatası:', err);
      alert('Ödeme sunucusuyla iletişim kurulurken bir hata oluştu.');
      setIsProcessing(false);
    }
  };

  // Sayfa yüklendiğinde kullanıcı profil bilgilerini otomatik çeken fonksiyon
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Profil endpointinize göre burayı değiştirebilirsiniz
        if (res.ok) {
          const data = await res.json();
          
          const profile = data.user || data.profile || data;
          
          let formattedAddress = '';
          let userCity = profile.city || 'Aydın';

          // JSON formatındaki dizi [ { id, title, city, district, detail } ] yapısını çözümleme
          if (profile.address) {
            try {
              const parsedAddresses = typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address;
              
              if (Array.isArray(parsedAddresses) && parsedAddresses.length > 0) {
                // Sepet ekranında ilk adresi otomatik seçili olarak getiriyoruz
                const primaryAddress = parsedAddresses[0]; 
                
                const addrParts = [];
                if (primaryAddress.district && primaryAddress.city) addrParts.push(`${primaryAddress.district} / ${primaryAddress.city}`);
                else if (primaryAddress.city) addrParts.push(primaryAddress.city);
                
                if (primaryAddress.detail) addrParts.push(primaryAddress.detail);
                
                formattedAddress = addrParts.join(', ');
                
                if (primaryAddress.city) {
                  userCity = primaryAddress.city;
                }
              } else if (typeof parsedAddresses === 'string') {
                 formattedAddress = parsedAddresses; // Dizi değilse düz metin olarak al
              }
            } catch (parseError) {
              console.error('Adres JSON formatı çözümlenemedi, ham metin kullanılacak.', parseError);
              formattedAddress = String(profile.address);
            }
            // Adresleri çözümle
if (profile.address) {
  try {
    const parsed = typeof profile.address === 'string' ? JSON.parse(profile.address) : profile.address;
    setSavedAddresses(Array.isArray(parsed) ? parsed : []);
  } catch (e) { console.error(e); }
}
          }

          setBuyerInfo({
            first_name: profile.first_name || profile.firstname || profile.firstName || '',
            last_name: profile.last_name || profile.lastname || profile.lastName || '',
            phone: profile.phone || '',
            address: formattedAddress,
            city: userCity,
            email: profile.email || ''
          });
        }
      } catch (err) {
        console.error('Profil bilgileri yüklenirken hata oluştu:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#5e0d0f]">Alışveriş Sepetiniz</h1>
          <p className="text-gray-500 text-sm mt-1">Eklediğiniz doğal lezzetleri buradan kontrol edebilirsiniz.</p>
          <div className="w-16 h-1 bg-[#D4A373] mt-4 rounded-full"></div>
        </div>

        {cart.length === 0 ? (
          // SEPET BOŞSA GÖSTERİLECEK ALAN
          <div className="bg-white rounded-[32px] p-12 md:p-20 text-center shadow-sm border border-[#D4A373]/10 max-w-2xl mx-auto animate-in fade-in duration-300">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-[#3C2F2F] mb-3">Sepetiniz Henüz Boş</h2>
            <p className="text-gray-400 text-sm mb-8">Harika yöresel ürünlerimizi incelemek ve sepetinizi doldurmak için mağazamıza göz atın.</p>
            <a href="/urunler" className="inline-block bg-[#5e0d0f] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#D4A373] transition-all shadow-md active:scale-95">
              Alışverişe Başla
            </a>
          </div>
        ) : (
          // SEPET DOLUYSA
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* SOL ALAN: Ürün Listesi */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-[#D4A373]/10 flex items-center justify-between gap-4 transition-all hover:shadow-md animate-in fade-in duration-300">
                  {/* Ürün Görseli */}
                  <div className="w-20 h-20 bg-[#FBF9F4] rounded-2xl flex items-center justify-center p-2 flex-shrink-0 border border-gray-100">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    ) : (
                      <div className="text-3xl">🧀</div>
                    )}
                  </div>

                  {/* Ürün Bilgisi */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">{item.category}</span>
                    <h3 className="font-bold text-[#3C2F2F] text-sm md:text-base truncate">{item.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">₺{item.price} / {item.unit}</p>
                  </div>

                  {/* Adet Kontrolü (Artı / Eksi) */}
                  <div className="flex items-center bg-[#F5F0E6] rounded-xl p-1 font-bold text-[#3C2F2F] shadow-inner">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-md"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg hover:bg-white transition-colors flex items-center justify-center text-md"
                    >
                      +
                    </button>
                  </div>

                  {/* Fiyat ve Silme Butonu */}
                  <div className="text-right flex flex-col items-end gap-2 pl-2">
                    <span className="font-extrabold text-[#5e0d0f] text-sm md:text-base">
                      ₺{item.price * item.quantity}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 text-xs transition-colors p-1"
                      title="Ürünü Sil"
                    >
                      ✕ Kaldır
                    </button>
                  </div>
                </div>
              ))}

              {/* Sepeti Temizle Butonu */}
              <div className="flex justify-start">
                <button 
                  onClick={clearCart}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors pl-2"
                >
                  🗑️ Tüm Sepeti Temizle
                </button>
              </div>
            </div>

            {/* SAĞ ALAN: Sipariş Özeti ve Fatura Kartı */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-lg border border-[#D4A373]/10 sticky top-24 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#3C2F2F] mb-4 pb-3 border-b border-gray-100">Sipariş Özeti</h3>
                
                <div className="space-y-4 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Sepet Toplamı</span>
                    <span className="text-[#3C2F2F] font-bold">₺{subtotal}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Kargo Ücreti</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-xs">Ücretsiz</span>
                    ) : (
                      <span className="text-[#3C2F2F] font-bold">₺{shippingFee}</span>
                    )}
                  </div>

                  {shippingFee > 0 && (
                    <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      💡 Siparişinize <span className="font-bold">₺{2000 - subtotal}</span> tutarında daha ürün eklemeniz durumunda kargo ücreti alınmayacaktır.
                    </p>
                  )}

                  <div className="h-px bg-gray-100 my-4"></div>

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base text-[#3C2F2F] font-bold">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-[#5e0d0f]">₺{totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* TESLİMAT BİLGİLERİ ALANI (Veritabanından Otomatik Olarak Çekilir) */}
              <div className="space-y-3 bg-[#F5F0E6]/30 p-4 rounded-2xl border border-[#D4A373]/20">
                <h4 className="text-xs font-bold text-[#5e0d0f]/80 uppercase tracking-wider mb-2">📋 Teslimat ve Fatura Bilgileri</h4>
                {savedAddresses.length > 0 && (
  <select 
    onChange={handleAddressSelect}
    className="w-full bg-white border border-[#D4A373]/30 rounded-xl py-2 px-3 text-xs text-[#5e0d0f] font-bold mb-3 outline-none cursor-pointer"
  >
    <option value="">Kayıtlı bir adres seçin...</option>
    {savedAddresses.map((adr) => (
      <option key={adr.id} value={adr.id}>{adr.title || 'Adresim'}</option>
    ))}
  </select>
)}
                {isLoadingProfile ? (
                  <div className="text-xs text-gray-500 animate-pulse py-2">Profil bilgileri yükleniyor...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Adınız" 
                        value={buyerInfo.first_name} 
                        onChange={e => setBuyerInfo({...buyerInfo, first_name: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                      />
                      <input 
                        type="text" 
                        placeholder="Soyadınız" 
                        value={buyerInfo.last_name} 
                        onChange={e => setBuyerInfo({...buyerInfo, last_name: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                      />
                    </div>

                    <input 
                      type="email" 
                      placeholder="E-posta Adresiniz" 
                      value={buyerInfo.email} 
                      onChange={e => setBuyerInfo({...buyerInfo, email: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                    />

                    <input 
                      type="tel" 
                      placeholder="Telefon Numaranız" 
                      value={buyerInfo.phone} 
                      onChange={e => setBuyerInfo({...buyerInfo, phone: e.target.value})}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                    />

                    <textarea 
                      placeholder="Teslimat Adresiniz" 
                      value={buyerInfo.address} 
                      onChange={e => setBuyerInfo({...buyerInfo, address: e.target.value})}
                      rows={3}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-[#D4A373] outline-none resize-none text-[#3C2F2F]"
                    />
                  </>
                )}
              </div>

              {/* AKSİYON BUTONLARI GRUBU */}
              <div className="flex flex-col gap-3 pt-2">
                
                {/* 🔒 ÜYE GİRİŞİ KONTROLÜ VE UYARI BALONCUĞU */}
                {!isLoadingProfile && !buyerInfo.email && (
                  <div className="bg-[#5e0d0f]/5 border border-[#5e0d0f]/20 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in duration-300">
                    <span className="text-base mt-0.5">💡</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#5e0d0f] uppercase tracking-wide mb-1">
                        Online Ödeme İçin Giriş Gerekli
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed font-medium">
                        Kredi veya banka kartı ile güvenli ödeme yapabilmek için <a href="/login" className="text-[#5e0d0f] font-bold underline hover:text-[#D4A373]">üye girişi yapmış olmanız</a> gereklidir. Üye değilseniz, siparişinizi aşağıdaki yeşil butona tıklayarak doğrudan <strong>WhatsApp</strong> üzerinden de kolayca tamamlayabilirsiniz.
                      </p>
                    </div>
                  </div>
                )}

                {/* ONLINE ÖDEME BUTONU (Üye girişi yapılmadıysa kilitlenir ve rengi soluklaşır) */}
                <button
                  onClick={handleOnlineCheckout}
                  disabled={isProcessing || isLoadingProfile || !buyerInfo.email}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                    buyerInfo.email && !isProcessing
                      ? 'bg-[#5e0d0f] text-white hover:bg-[#3d080a] active:scale-[0.99]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300/30'
                  }`}
                >
                  {isProcessing ? (
                    <span>Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Kredi / Banka Kartı ile Güvenli Öde
                    </>
                  )}
                </button>

                {/* SEÇENEK AYIRICI ALAN */}
                <div className="flex items-center text-center my-1">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-gray-400 text-xs px-2 font-medium">veya</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                

                {/* WHATSAPP SİPARİŞ BUTONU (Ziyaretçiler için her zaman aktiftir) */}
                <button 
                  onClick={handleWhatsAppCheckout}
                  disabled={isLoadingProfile}
                  className="w-full bg-[#25D366] text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-[#20C25A] transition-all shadow-md text-center active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.372 5.378 0 12.001 0c3.21 0 6.225 1.251 8.5 3.522 2.273 2.27 3.524 5.286 3.522 8.501-.004 6.63-5.379 12-12.004 12-2.003 0-3.975-.497-5.732-1.44L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.411 1.451 5.428 0 9.85-4.417 9.854-9.848.002-2.63-1.023-5.101-2.884-6.963C17.11 1.932 14.634.928 12.001.928c-5.43 0-9.852 4.418-9.855 9.849-.002 1.984.518 3.922 1.507 5.64l-.386 1.41.414-.108 1.545-.405z" />
                  </svg>
                  Siparişi WhatsApp ile Tamamla
                </button>
                
                <p className="text-[10px] text-gray-400 text-center mt-1">
                  Sipariş listeniz otomatik hazırlanarak WhatsApp hattımıza iletilecektir.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}