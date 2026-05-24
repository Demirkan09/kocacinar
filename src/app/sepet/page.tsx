'use client';
import { useCart } from '@/app/components/cart';
import Image from 'next/image';

export default function SepetPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  // Toplam sepet tutarını hesaplama
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = subtotal >= 2000 || subtotal === 0 ? 0 : 75; // 2000 TL üzeri kargo bedava kuralı kanka
  const totalAmount = subtotal + shippingFee;

  // WhatsApp'a sipariş listesini profesyonelce mesaj olarak gönderme
  const handleWhatsAppCheckout = () => {
    let message = `*Koca Çınar Şarküteri - Yeni Sipariş*\n\n`;
    cart.forEach((item, index) => {
      message += `${index + 1}) *${item.name}* - ${item.quantity} ${item.unit || 'kg'} x ₺${item.price} \n`;
    });
    message += `\n-------------------------\n`;
    message += `*Ara Toplam:* ₺${subtotal}\n`;
    message += `*Kargo:* ${shippingFee === 0 ? 'Ücretsiz' : `₺${shippingFee}`}\n`;
    message += `*Toplam Tutar:* *₺${totalAmount}*\n\n`;
    message += `Adres ve teslimat bilgileri için dönüşünüzü bekliyorum.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/905513404848?text=${encodedMessage}`, '_blank');
  };

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
          // SEPET DOLUYSA (İSKELET DÜZEN)
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

            {/* SAĞ ALAN: Sipariş Özeti (Fatura Kartı) */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-lg border border-[#D4A373]/10 sticky top-24">
              <h3 className="text-xl font-bold text-[#3C2F2F] mb-6 pb-3 border-b border-gray-100">Sipariş Özeti</h3>
              
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
                    💡 <span className="font-bold">₺{2000 - subtotal}</span> liralık daha ürün ekleyin, kargo ücreti bedava olsun!
                  </p>
                )}

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="flex justify-between items-end pt-2">
                  <span className="text-base text-[#3C2F2F] font-bold">Genel Toplam</span>
                  <span className="text-2xl font-extrabold text-[#5e0d0f]">₺{totalAmount}</span>
                </div>
              </div>

              {/* Siparişi WhatsApp ile Tamamlama (CTA) */}
              <button 
                onClick={handleWhatsAppCheckout}
                className="w-full mt-8 bg-[#25D366] text-white font-bold py-4 rounded-2xl hover:bg-[#20C25A] transition-all shadow-md hover:shadow-[#25D366]/30 text-center active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                🟢 Siparişi WhatsApp ile Tamamla
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-3">
                Sipariş listeniz otomatik hazırlanarak WhatsApp hattımıza iletilecektir.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}