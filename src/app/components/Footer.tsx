import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#2A2020] text-[#D4A373] py-16 border-t-[6px] border-[#5e0d0f] w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-extrabold tracking-wider text-white mb-2">KOCA ÇINAR</h2>
          <p className="text-sm font-medium tracking-widest uppercase opacity-80">Şarküteri & Yöresel</p>
        </div>
        
        <div className="text-gray-400 text-sm flex flex-col items-center md:items-end">
          <p>Kalite ve Doğallığın Adresi.</p>
          <p className="mt-1">© {new Date().getFullYear()} Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}