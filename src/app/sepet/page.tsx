'use client';
import { useCart } from '@/app/components/cart';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getCities, getDistrictsForCity, getNeighborhoodsForDistrict } from '@/lib/turkeyLocations';
import { formatPhoneNumber, getRawPhoneNumber } from '@/lib/phoneMask';

export default function SepetPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [settings, setSettings] = useState({
    min_order_amount: 150,
    shipping_fee: 75,
    free_shipping_threshold: 2000
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            min_order_amount: Number(data.min_order_amount || 150),
            shipping_fee: Number(data.shipping_fee || 75),
            free_shipping_threshold: Number(data.free_shipping_threshold || 2000)
          });
        }
      } catch (err) {
        console.error('Ayarlar yüklenemedi:', err);
      }
    };
    fetchSettings();
  }, []);

  // Toplam sepet tutarını hesaplama
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const freeShippingThreshold = Number(settings.free_shipping_threshold);
  const baseShippingFee = Number(settings.shipping_fee);
  const minOrderAmount = Number(settings.min_order_amount);

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : baseShippingFee;
  const totalAmount = subtotal + shippingFee;
  const isBelowMinOrder = subtotal < minOrderAmount && subtotal > 0;

  // Ödeme yapacak müşterinin bilgileri için state yapısı
  const [buyerInfo, setBuyerInfo] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: 'Aydın',
    district: 'Efeler',
    neighborhood: '',
    postcode: '',
    email: '',
    // Fatura & Kurumsal Alanlar
    same_as_shipping: true,
    billing_first_name: '',
    billing_last_name: '',
    billing_address: '',
    billing_city: 'Aydın',
    billing_district: 'Efeler',
    billing_neighborhood: '',
    billing_postcode: '',
    is_corporate: false,
    company_name: '',
    tax_number: '',
    tax_office: ''
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
        address: selected.detail || '',
        city: selected.city || 'Aydın',
        district: selected.district || 'Efeler',
        is_corporate: selected.is_corporate || false,
        company_name: selected.company_name || '',
        tax_number: selected.tax_number || '',
        tax_office: selected.tax_office || ''
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
    message += `*Ara Toplam:* ₺${subtotal.toFixed(2)}\n`;
    message += `*Kargo:* ${shippingFee === 0 ? 'Ücretsiz' : `₺${shippingFee.toFixed(2)}`}\n`;
    message += `*Toplam Tutar:* *₺${totalAmount.toFixed(2)}*\n\n`;
    
    const fullShipping = [
      buyerInfo.neighborhood ? `Mah: ${buyerInfo.neighborhood}` : '',
      buyerInfo.address,
      buyerInfo.district ? `${buyerInfo.district} / ${buyerInfo.city}` : buyerInfo.city,
      buyerInfo.postcode ? `PK: ${buyerInfo.postcode}` : ''
    ].filter(Boolean).join(', ');

    message += `*Teslimat Bilgileri:*\n`;
    message += `Ad Soyad: ${buyerInfo.first_name} ${buyerInfo.last_name}\n`;
    message += `Tel: +90 ${formatPhoneNumber(buyerInfo.phone)}\n`;
    message += `Adres: ${fullShipping}\n\n`;

    if (!buyerInfo.same_as_shipping) {
      const fullBilling = [
        buyerInfo.billing_neighborhood ? `Mah: ${buyerInfo.billing_neighborhood}` : '',
        buyerInfo.billing_address,
        buyerInfo.billing_district ? `${buyerInfo.billing_district} / ${buyerInfo.billing_city}` : buyerInfo.billing_city,
        buyerInfo.billing_postcode ? `PK: ${buyerInfo.billing_postcode}` : ''
      ].filter(Boolean).join(', ');

      message += `*Fatura Adresi:*\n`;
      message += `Ad Soyad: ${buyerInfo.billing_first_name || buyerInfo.first_name} ${buyerInfo.billing_last_name || buyerInfo.last_name}\n`;
      message += `Adres: ${fullBilling}\n\n`;
    }

    if (buyerInfo.is_corporate) {
      message += `*Kurumsal Fatura Bilgileri:*\n`;
      message += `Firma Adı: ${buyerInfo.company_name}\n`;
      message += `Vergi No: ${buyerInfo.tax_number}\n`;
      message += `Vergi Dairesi: ${buyerInfo.tax_office}\n\n`;
    }

    message += `Merhaba, bu ürünleri sipariş etmek istiyorum.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/905513404848?text=${encodedMessage}`, '_blank');
  };
  
  // Online ödeme sayfasına yönlendirme fonksiyonu
  const handleOnlineCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Zorunlu teslimat alanlarının kontrolü
    if (!buyerInfo.first_name || !buyerInfo.last_name || !buyerInfo.phone || !buyerInfo.address || !buyerInfo.email || !buyerInfo.city || !buyerInfo.district) {
      alert('Lütfen teslimat ve iletişim bilgilerinizi eksiksiz doldurunuz.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyerInfo.email)) {
      alert('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }

    if (buyerInfo.phone.length < 10) {
      alert('Lütfen geçerli bir telefon numarası giriniz (10 hane: 5XXXXXXXXX).');
      return;
    }

    // Ayrı fatura adresi seçildiyse kontrol
    if (!buyerInfo.same_as_shipping) {
      if (!buyerInfo.billing_first_name || !buyerInfo.billing_last_name || !buyerInfo.billing_address || !buyerInfo.billing_city || !buyerInfo.billing_district) {
        alert('Lütfen fatura adresi ve alıcı bilgilerini eksiksiz doldurunuz.');
        return;
      }
    }

    // Kurumsal fatura seçildiyse kontrol
    if (buyerInfo.is_corporate) {
      if (!buyerInfo.company_name || !buyerInfo.tax_number || !buyerInfo.tax_office) {
        alert('Lütfen kurumsal fatura için Firma Adı, Vergi Numarası ve Vergi Dairesi alanlarını doldurunuz.');
        return;
      }
    }

    if (cart.length === 0) {
      return;
    }

    setIsProcessing(true);

    const fullShipping = [
      buyerInfo.neighborhood ? `Mah: ${buyerInfo.neighborhood}` : '',
      buyerInfo.address,
      buyerInfo.district ? `${buyerInfo.district} / ${buyerInfo.city}` : buyerInfo.city,
      buyerInfo.postcode ? `PK: ${buyerInfo.postcode}` : ''
    ].filter(Boolean).join(', ');

    const fullBilling = buyerInfo.same_as_shipping ? fullShipping : [
      buyerInfo.billing_neighborhood ? `Mah: ${buyerInfo.billing_neighborhood}` : '',
      buyerInfo.billing_address,
      buyerInfo.billing_district ? `${buyerInfo.billing_district} / ${buyerInfo.billing_city}` : buyerInfo.billing_city,
      buyerInfo.billing_postcode ? `PK: ${buyerInfo.billing_postcode}` : ''
    ].filter(Boolean).join(', ');

    const combinedBuyerInfo = {
      ...buyerInfo,
      address: fullShipping,
      billing_address: fullBilling
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: cart,
          totalPrice: totalAmount,
          shippingFee: shippingFee,
          buyerInfo: combinedBuyerInfo
        })
      });

      const data = await res.json();

      if (data.status === 'success' && data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
      } else {
        const errorMsg = data.errorMessage || data.error || 'Bilinmeyen hata';
        alert(`Ödeme başlatılamadı: ${errorMsg}`);
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

          setBuyerInfo(prev => ({
            ...prev,
            first_name: profile.first_name || profile.firstname || profile.firstName || '',
            last_name: profile.last_name || profile.lastname || profile.lastName || '',
            phone: profile.phone || '',
            address: formattedAddress,
            city: userCity,
            email: profile.email || ''
          }));
        }
      } catch (err) {
        console.error('Profil bilgileri yüklenirken hata oluştu:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

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
                      ₺{(item.price * item.quantity).toFixed(2)}
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

            {/* SAĞ ALAN: Sipariş Özeti Kartı */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-lg border border-[#D4A373]/10 sticky top-24 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#3C2F2F] mb-4 pb-3 border-b border-gray-100">Sipariş Özeti</h3>
                
                <div className="space-y-4 text-sm font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Sepet Toplamı</span>
                    <span className="text-[#3C2F2F] font-bold">₺{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Kargo Ücreti</span>
                    {shippingFee === 0 ? (
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md text-xs">Ücretsiz</span>
                    ) : (
                      <span className="text-[#3C2F2F] font-bold">₺{shippingFee.toFixed(2)}</span>
                    )}
                  </div>

                  {shippingFee > 0 && (
                    <p className="text-[11px] text-amber-600 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                      💡 Siparişinize <span className="font-bold">₺{(freeShippingThreshold - subtotal).toFixed(2)}</span> tutarında daha ürün eklemeniz durumunda kargo ücreti alınmayacaktır.
                    </p>
                  )}

                  <div className="h-px bg-gray-100 my-4"></div>

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-base text-[#3C2F2F] font-bold">Genel Toplam</span>
                    <span className="text-2xl font-extrabold text-[#5e0d0f]">₺{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* ⚠️ MİNİMUM SİPARİŞ TUTARI UYARISI */}
              {isBelowMinOrder && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold text-left animate-in fade-in duration-300">
                  <span className="text-base mr-1">⚠️</span>
                  Sipariş verebilmek için minimum sepet tutarı <strong>₺{minOrderAmount}</strong> olmalıdır. Siparişinizi tamamlamak için sepetinize <strong>₺{(minOrderAmount - subtotal).toFixed(2)}</strong> tutarında daha ürün eklemelisiniz.
                </div>
              )}

              {/* SEPETİ ONAYLA BUTONU */}
              <button
                onClick={() => setIsCheckoutModalOpen(true)}
                disabled={isBelowMinOrder}
                className={`w-full py-4 px-6 rounded-2xl font-extrabold text-base transition-all flex items-center justify-center gap-2 shadow-md ${
                  !isBelowMinOrder
                    ? 'bg-[#5e0d0f] text-white hover:bg-[#3d080a] active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none border border-gray-300/30'
                }`}
              >
                <span>Sepeti Onayla</span>
                <span className="text-xl">➔</span>
              </button>

              {/* İYZİCO ÖDEME GÖRSELİ */}
              <div className="pt-2 flex justify-center items-center">
                <img 
                  src="/iyzico_ile_ode_colored.png" 
                  alt="İyzico ile Güvenli Ödeme" 
                  className="max-h-16 w-auto object-contain mx-auto"
                />
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL: TESLİMAT VE ÖDEME BİLGİLERİ PENCERESİ */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] max-w-lg w-full p-4 sm:p-6 md:p-8 shadow-2xl relative border border-[#D4A373]/20 my-auto md:my-6 max-h-[92vh] flex flex-col">
            
            {/* KAPAT BUTONU */}
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-[#5e0d0f] hover:text-white transition-all flex items-center justify-center font-bold text-sm z-10"
              title="Kapat"
            >
              ✕
            </button>

            {/* MODAL BAŞLIĞI */}
            <div className="mb-3 sm:mb-4 pr-8 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-[#3C2F2F] flex items-center gap-2">
                <span>📋</span> Teslimat ve Fatura Bilgileri
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Lütfen siparişinizin sorunsuz ulaşması için bilgileri eksiksiz doldurunuz.</p>
            </div>

            {/* SCROLL EDİLEBİLİR FORM İÇERİĞİ */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 no-scrollbar">
              {savedAddresses.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#5e0d0f] mb-1">Kayıtlı Adresleriniz</label>
                  <select 
                    onChange={handleAddressSelect}
                    className="w-full bg-[#FBF9F4] border border-[#D4A373]/30 rounded-xl py-2 px-3 text-xs text-[#5e0d0f] font-bold outline-none cursor-pointer"
                  >
                    <option value="">Kayıtlı bir adres seçin...</option>
                    {savedAddresses.map((adr) => (
                      <option key={adr.id} value={adr.id}>{adr.title || 'Adresim'}</option>
                    ))}
                  </select>
                </div>
              )}

              {isLoadingProfile ? (
                <div className="text-xs text-gray-500 animate-pulse py-4 text-center">Profil bilgileri yükleniyor...</div>
              ) : (
                <>
                  {/* TESLİMAT BİLGİLERİ */}
                  <div className="space-y-3 bg-gray-50/50 p-3 sm:p-4 rounded-2xl border border-gray-100">
                    <h4 className="text-xs font-extrabold text-[#5e0d0f] uppercase tracking-wider flex items-center gap-1.5">
                      <span>🚚</span> Teslimat Adresi
                    </h4>
                    
                    {/* Ad & Soyad */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Adınız *</label>
                        <input 
                          type="text" 
                          placeholder="Adınız" 
                          value={buyerInfo.first_name} 
                          onChange={e => setBuyerInfo({...buyerInfo, first_name: e.target.value})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Soyadınız *</label>
                        <input 
                          type="text" 
                          placeholder="Soyadınız" 
                          value={buyerInfo.last_name} 
                          onChange={e => setBuyerInfo({...buyerInfo, last_name: e.target.value})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                        />
                      </div>
                    </div>

                    {/* E-posta */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">E-posta Adresiniz *</label>
                      <input 
                        type="email" 
                        placeholder="E-posta Adresiniz" 
                        value={buyerInfo.email} 
                        onChange={e => setBuyerInfo({...buyerInfo, email: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                      />
                    </div>

                    {/* Telefon (+90 maskeli kutu) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Telefon *</label>
                      <div className="flex">
                        <div className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-3 flex items-center justify-center text-xs font-bold text-gray-500 select-none">
                          +90
                        </div>
                        <input 
                          type="tel" 
                          placeholder="(___) _______" 
                          maxLength={15}
                          value={formatPhoneNumber(buyerInfo.phone)} 
                          onChange={e => {
                            const raw = getRawPhoneNumber(e.target.value);
                            setBuyerInfo({...buyerInfo, phone: raw});
                          }}
                          className="w-full bg-white border border-gray-200 rounded-r-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium tracking-wider"
                        />
                      </div>
                    </div>

                    {/* Posta Kodu */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Posta Kodu</label>
                      <input 
                        type="text" 
                        maxLength={5}
                        value={buyerInfo.postcode} 
                        onChange={e => setBuyerInfo({...buyerInfo, postcode: e.target.value.replace(/\D/g, '')})}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                      />
                    </div>

                    {/* İl & İlçe Seçimi */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">İl *</label>
                        <select 
                          value={buyerInfo.city} 
                          onChange={e => {
                            const newCity = e.target.value;
                            const districts = getDistrictsForCity(newCity);
                            const firstDistrict = districts[0] || '';
                            setBuyerInfo({...buyerInfo, city: newCity, district: firstDistrict, neighborhood: ''});
                          }}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                        >
                          {getCities().map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">İlçe *</label>
                        <select 
                          value={buyerInfo.district} 
                          onChange={e => setBuyerInfo({...buyerInfo, district: e.target.value, neighborhood: ''})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                        >
                          {getDistrictsForCity(buyerInfo.city).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mahalle */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mahalle *</label>
                      <select 
                        value={buyerInfo.neighborhood} 
                        onChange={e => setBuyerInfo({...buyerInfo, neighborhood: e.target.value})}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                      >
                        <option value="">Seçiniz...</option>
                        {getNeighborhoodsForDistrict(buyerInfo.city, buyerInfo.district).map((n, idx) => (
                          <option key={`${n}-${idx}`} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Açık Adres */}
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Teslimat Adresiniz *</label>
                      <textarea 
                        placeholder="Cadde, sokak, bina no, daire no vb. açık adres detayları..." 
                        value={buyerInfo.address} 
                        onChange={e => setBuyerInfo({...buyerInfo, address: e.target.value})}
                        rows={2}
                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none resize-none text-[#3C2F2F]"
                      />
                    </div>
                  </div>

                  {/* KUTUCUK 1: FATURA ADRESİ TESLİMAT ADRESİYLE AYNI MI? */}
                  <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3C2F2F] select-none">
                      <input 
                        type="checkbox"
                        checked={buyerInfo.same_as_shipping}
                        onChange={e => setBuyerInfo({ ...buyerInfo, same_as_shipping: e.target.checked })}
                        className="w-4 h-4 rounded text-[#5e0d0f] focus:ring-[#D4A373] cursor-pointer"
                      />
                      Fatura adresim teslimat adresimle aynı
                    </label>
                  </div>

                  {/* AYRI FATURA ADRESİ FORMU (Eğer aynı değilse açılır) */}
                  {!buyerInfo.same_as_shipping && (
                    <div className="space-y-3 bg-amber-50/50 p-3 sm:p-4 rounded-2xl border border-amber-200/60 animate-in fade-in duration-200">
                      <h4 className="text-xs font-extrabold text-[#5e0d0f] uppercase tracking-wider flex items-center gap-1.5">
                        <span>📄</span> Fatura Adresi Bilgileri
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Ad *</label>
                          <input 
                            type="text" 
                            placeholder="Adınız" 
                            value={buyerInfo.billing_first_name} 
                            onChange={e => setBuyerInfo({...buyerInfo, billing_first_name: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Soyad *</label>
                          <input 
                            type="text" 
                            placeholder="Soyadınız" 
                            value={buyerInfo.billing_last_name} 
                            onChange={e => setBuyerInfo({...buyerInfo, billing_last_name: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                          />
                        </div>
                      </div>

                      {/* Posta Kodu */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Posta Kodu</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          value={buyerInfo.billing_postcode} 
                          onChange={e => setBuyerInfo({...buyerInfo, billing_postcode: e.target.value.replace(/\D/g, '')})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                        />
                      </div>

                      {/* Fatura İl & İlçe */}
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">İl *</label>
                          <select 
                            value={buyerInfo.billing_city} 
                            onChange={e => {
                              const newCity = e.target.value;
                              const districts = getDistrictsForCity(newCity);
                              const firstDistrict = districts[0] || '';
                              setBuyerInfo({...buyerInfo, billing_city: newCity, billing_district: firstDistrict, billing_neighborhood: ''});
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                          >
                            {getCities().map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">İlçe *</label>
                          <select 
                            value={buyerInfo.billing_district} 
                            onChange={e => setBuyerInfo({...buyerInfo, billing_district: e.target.value, billing_neighborhood: ''})}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                          >
                            {getDistrictsForCity(buyerInfo.billing_city).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Fatura Mahalle */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Mahalle *</label>
                        <select 
                          value={buyerInfo.billing_neighborhood} 
                          onChange={e => setBuyerInfo({...buyerInfo, billing_neighborhood: e.target.value})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none text-[#3C2F2F] font-medium cursor-pointer"
                        >
                          <option value="">Seçiniz...</option>
                          {getNeighborhoodsForDistrict(buyerInfo.billing_city, buyerInfo.billing_district).map((n, idx) => (
                            <option key={`${n}-${idx}`} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>

                      {/* Fatura Adresi Detay */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Fatura Adresi *</label>
                        <textarea 
                          placeholder="Fatura adresi detayları..." 
                          value={buyerInfo.billing_address} 
                          onChange={e => setBuyerInfo({...buyerInfo, billing_address: e.target.value})}
                          rows={2}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#D4A373] outline-none resize-none text-[#3C2F2F]"
                        />
                      </div>
                    </div>
                  )}

                  {/* KUTUCUK 2: KURUMSAL FATURA İSTİYORUM */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#5e0d0f] select-none">
                      <input 
                        type="checkbox"
                        checked={buyerInfo.is_corporate}
                        onChange={e => setBuyerInfo({ ...buyerInfo, is_corporate: e.target.checked })}
                        className="w-4 h-4 rounded text-[#5e0d0f] focus:ring-[#D4A373] cursor-pointer"
                      />
                      🏢 Kurumsal fatura istiyorum
                    </label>
                  </div>

                  {/* KURUMSAL FATURA ALANLARI (Eğer işaretlendiyse açılır) */}
                  {buyerInfo.is_corporate && (
                    <div className="space-y-3 bg-blue-50/50 p-3 sm:p-4 rounded-2xl border border-blue-200/60 animate-in fade-in duration-200">
                      <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🏢</span> Kurumsal Fatura Bilgileri
                      </h4>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">Firma Adı *</label>
                        <input 
                          type="text" 
                          placeholder="Firma Resmi Unvanı" 
                          value={buyerInfo.company_name} 
                          onChange={e => setBuyerInfo({...buyerInfo, company_name: e.target.value})}
                          className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-400 outline-none text-[#3C2F2F]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Vergi Numarası *</label>
                          <input 
                            type="text" 
                            placeholder="Vergi No / VKNO" 
                            value={buyerInfo.tax_number} 
                            onChange={e => setBuyerInfo({...buyerInfo, tax_number: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-400 outline-none text-[#3C2F2F]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">Vergi Dairesi *</label>
                          <input 
                            type="text" 
                            placeholder="Vergi Dairesi Adı" 
                            value={buyerInfo.tax_office} 
                            onChange={e => setBuyerInfo({...buyerInfo, tax_office: e.target.value})}
                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-blue-400 outline-none text-[#3C2F2F]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* AKSİYON BUTONLARI GRUBU (SABİT ALT ALAN) */}
            <div className="flex flex-col gap-2.5 sm:gap-3 pt-3.5 mt-2 border-t border-gray-100 shrink-0">
              
              {/* 🔒 ÜYE GİRİŞİ KONTROLÜ VE UYARI BALONCUĞU */}
              {!isLoadingProfile && !buyerInfo.email && (
                <div className="bg-[#5e0d0f]/5 border border-[#5e0d0f]/20 rounded-2xl p-3 sm:p-4 flex gap-2.5 items-start animate-in fade-in duration-300">
                  <span className="text-sm sm:text-base mt-0.5">💡</span>
                  <div className="text-left">
                    <p className="text-[11px] sm:text-xs font-bold text-[#5e0d0f] uppercase tracking-wide mb-0.5">
                      Online Ödeme İçin Giriş Gerekli
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed font-medium">
                      Kredi veya banka kartı ile güvenli ödeme yapabilmek için <a href="/login" className="text-[#5e0d0f] font-bold underline hover:text-[#D4A373]">üye girişi yapmış olmanız</a> gereklidir. Üye değilseniz, siparişinizi aşağıdaki yeşil butona tıklayarak doğrudan <strong>WhatsApp</strong> üzerinden de kolayca tamamlayabilirsiniz.
                    </p>
                  </div>
                </div>
              )}

              {/* ONLINE ÖDEME BUTONU */}
              <button
                onClick={handleOnlineCheckout}
                disabled={isProcessing || isLoadingProfile || !buyerInfo.email || isBelowMinOrder}
                className={`w-full py-2.5 sm:py-3 px-4 rounded-2xl font-bold transition-all flex items-center justify-center shadow-sm h-12 sm:h-14 ${
                  buyerInfo.email && !isProcessing && !isBelowMinOrder
                    ? 'bg-white border-2 border-[#1967d2] hover:bg-gray-50 active:scale-[0.99]'
                    : 'bg-gray-100 border border-gray-200 cursor-not-allowed opacity-60 shadow-none'
                }`}
              >
                {isProcessing ? (
                  <span className="text-[#1967d2] font-bold text-xs sm:text-sm">Güvenli Ödeme Sayfasına Yönlendiriliyorsunuz...</span>
                ) : (
                  <img 
                    src="/iyzico_ile_ode_colored_horizontal.png" 
                    alt="iyzico ile Öde" 
                    className="h-7 sm:h-9 w-auto object-contain" 
                  />
                )}
              </button>

              {/* SEÇENEK AYIRICI ALAN */}
              <div className="flex items-center text-center my-0.5">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-gray-400 text-[11px] px-2 font-medium">veya</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* WHATSAPP SİPARİŞ BUTONU */}
              <button 
                onClick={handleWhatsAppCheckout}
                disabled={isLoadingProfile || isBelowMinOrder}
                className="w-full bg-[#25D366] text-white font-bold py-3 sm:py-3.5 px-4 rounded-2xl hover:bg-[#20C25A] transition-all shadow-md text-center active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.372 5.378 0 12.001 0c3.21 0 6.225 1.251 8.5 3.522 2.273 2.27 3.524 5.286 3.522 8.501-.004 6.63-5.379 12-12.004 12-2.003 0-3.975-.497-5.732-1.44L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.411 1.451 5.428 0 9.85-4.417 9.854-9.848.002-2.63-1.023-5.101-2.884-6.963C17.11 1.932 14.634.928 12.001.928c-5.43 0-9.852 4.418-9.855 9.849-.002 1.984.518 3.922 1.507 5.64l-.386 1.41.414-.108 1.545-.405z" />
                </svg>
                Siparişi WhatsApp ile Tamamla
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-0.5">
                Sipariş listeniz otomatik hazırlanarak WhatsApp hattımıza iletilecektir.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}