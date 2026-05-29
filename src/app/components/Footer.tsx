import React from 'react';
import Link from 'next/link'; // Next.js'in kendi Link componentini import ediyoruz

export default function Footer() {
  return (
    <footer className="bg-[#2A2020] text-[#D4A373] py-12 border-t-[6px] border-[#5e0d0f] w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
        
        {/* SOL: Marka */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-wider text-white mb-2">KOCA ÇINAR</h2>
          <p className="text-sm font-medium tracking-widest uppercase opacity-80">Şarküteri & Yöresel</p>
        </div>
        
        {/* ORTA: Yasal Linkler (İyzico için eklendi) */}
        <div className="flex flex-col gap-2 text-sm font-medium">
          <Link href="/mesafeli-satis-sozlesmesi" className="text-gray-300 hover:text-[#D4A373] transition-colors">
            Mesafeli Satış Sözleşmesi
          </Link>
          <Link href="/iptal-ve-iade" className="text-gray-300 hover:text-[#D4A373] transition-colors">
            İptal ve İade Koşulları
          </Link>
          <Link href="/gizlilik-ve-kvkk" className="text-gray-300 hover:text-[#D4A373] transition-colors">
            Gizlilik ve KVKK Metni
          </Link>
        </div>

        {/* SAĞ: Copyright ve Slogan */}
        <div className="text-gray-400 text-sm flex flex-col items-center md:items-end">
          <p>Kalite ve Doğallığın Adresi.</p>
          <p className="mt-1">© {new Date().getFullYear()} Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>

      </div>
    </footer>
  );
}