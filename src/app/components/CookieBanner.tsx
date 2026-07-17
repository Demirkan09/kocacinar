'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Kullanıcı daha önce onaylamış mı kontrol et
    const isAccepted = localStorage.getItem('kocacinar_cookies_accepted');
    if (!isAccepted) {
      // Sayfa yüklendikten 1.5 saniye sonra şık bir animasyonla ekrana gelsin
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kocacinar_cookies_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-50 bg-white/95 backdrop-blur-md text-[#3C2F2F] p-6 rounded-[24px] shadow-[0_20px_50px_rgba(94,13,15,0.15)] border border-[#D4A373]/20 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col gap-4">
        {/* Başlık ve Resmi İkon */}
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">🍪</span>
          <h4 className="font-extrabold text-[#5e0d0f] text-base tracking-wide uppercase">Çerez Bilgilendirmesi</h4>
        </div>

        {/* Profesyonel ve Yasal Uyarı Metni */}
        <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">
          Koca Çınar Şarküteri olarak, yasal düzenlemelere uygun çerezler (cookies) kullanıyoruz. Detaylı yasal bilgilendirmeye 
          <Link href="/gizlilik-ve-kvkk" className="text-[#5e0d0f] font-bold underline hover:text-[#D4A373] transition-colors ml-1">
            Gizlilik, Kullanım Şartları ve Çerez Politikası
          </Link> metnimizden ulaşabilirsiniz.
        </p>

        {/* Sadece Tek Onay Butonu */}
        <div className="flex items-center justify-end pt-2 border-t border-[#D4A373]/10">
          <button
            onClick={handleAccept}
            className="w-full md:w-auto bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold text-xs md:text-sm px-8 py-3.5 rounded-xl transition-all shadow-md shadow-[#5e0d0f]/10 active:scale-95 text-center"
          >
            Anladım, Kabul Ediyorum
          </button>
        </div>
      </div>
    </div>
  );
}