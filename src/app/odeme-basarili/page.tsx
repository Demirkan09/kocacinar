"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/app/components/cart"; // Sepet hook'unu içe aktarıyoruz

export default function OdemeBasarili() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const { clearCart } = useCart(); // Sepeti temizleme fonksiyonunu alıyoruz

  // Zombi sepeti engellemek için güncellenmiş temizleme işlemi
  useEffect(() => {
    // Sayfa ilk yüklendiğinde React'in localStorage'ı okumasını (hydration) 
    // beklemesi için ufak bir gecikme veriyoruz.
    const clearTimer = setTimeout(() => {
      // 1. React State'ini temizle
      clearCart();

      // 2. Garanti olması için tarayıcı hafızasını zorla temizle
      // Not: Eğer useCart hook'unda localStorage için farklı bir isim ('cart-storage', 'basket' vs.) 
      // kullanıyorsan aşağıdaki 'cart' yazan yerleri ona göre değiştirmelisin.
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cart-storage'); // Zustand vs kullanıyorsan default isimler
      } catch (e) {
        console.error("LocalStorage temizlenirken hata:", e);
      }
    }, 500); // Yarım saniye bekle ve vur

    return () => clearTimeout(clearTimer);
  }, [clearCart]);

  useEffect(() => {
    // Sayaç 0 olduğunda yönlendirme yap
    if (countdown === 0) {
      router.push("/urunler");
      return;
    }

    // Her 1 saniyede bir sayacı düşür
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // Component unmount olduğunda sayacı temizle
    return () => clearInterval(timer);
  }, [countdown, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-green-500">
        {/* Başarılı İkonu */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">Ödeme Başarılı!</h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          Siparişiniz başarıyla alınmıştır. Bizi tercih ettiğiniz için teşekkür ederiz. 
          Siparişinizin durumunu <Link href="/profil" className="text-[#5e0d0f] font-semibold underline">Profilim &gt; Siparişlerim</Link> sekmesinden takip edebilirsiniz.
        </p>

        <div className="bg-gray-100 p-4 rounded-lg mb-8">
          <p className="text-sm text-gray-500 font-medium">
            <span className="text-lg font-bold text-[#5e0d0f]">{countdown}</span> saniye içinde ürünler sayfasına yönlendirileceksiniz...
          </p>
        </div>

        <button 
          onClick={() => router.push("/urunler")}
          className="w-full bg-[#2A2020] hover:bg-[#5e0d0f] transition-colors text-white font-bold py-3 px-4 rounded-lg"
        >
          Hemen Yönlendir
        </button>
      </div>
    </div>
  );
}