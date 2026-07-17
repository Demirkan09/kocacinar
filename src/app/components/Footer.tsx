import React from 'react';
import Link from 'next/link';
import { 
  HiOutlineMapPin, 
  HiOutlinePhone, 
  HiOutlineEnvelope 
} from "react-icons/hi2";
import { FaInstagram, FaWhatsapp } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-[#2A2020] text-gray-300 py-16 border-t-[6px] border-[#5e0d0f] w-full mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* 1. KOLON: Marka ve Hakkımızda */}
        <div className="flex flex-col">
          <h2 className="text-3xl font-extrabold tracking-wider text-white mb-2">KOCA ÇINAR</h2>
          <p className="text-[#D4A373] text-sm font-bold tracking-widest uppercase mb-6">Şarküteri & Yöresel</p>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Aydın'ın kalbinden, en taze ve doğal yöresel lezzetleri güvenle sofralarınıza taşıyoruz. Kalite ve doğallığın adresi.
          </p>
          {/* Sosyal Medya İkonları */}
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/kocacinarcifligi?igsh=bm5rdtnpegswexkw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white transition-all shadow-sm"
            >
              <FaInstagram className="text-lg" />
            </a>
            <a 
              href="https://wa.me/905513404848" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
            >
              <FaWhatsapp className="text-lg" />
            </a>
          </div>
        </div>

        {/* 2. KOLON: İletişim Bilgileri */}
        <div>
          <h3 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">İletişim</h3>
          <ul className="space-y-5 text-sm">
            <li className="flex items-start gap-3 group">
              <HiOutlineMapPin className="text-[#D4A373] text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform"/> 
              <span className="text-gray-400 leading-relaxed">
                Çeştepe Mahallesi, Barış Caddesi<br />NO: 6/1 Aydın / Merkez
              </span>
            </li>
            <li className="flex items-center gap-3 group">
              <HiOutlinePhone className="text-[#D4A373] text-xl shrink-0 group-hover:scale-110 transition-transform"/> 
              <a href="tel:+905513404848" className="text-gray-400 hover:text-white transition-colors">
                +90 551 340 48 48
              </a>
            </li>
            <li className="flex items-center gap-3 group">
              <HiOutlineEnvelope className="text-[#D4A373] text-xl shrink-0 group-hover:scale-110 transition-transform"/> 
              <a href="mailto:kocacinarciftlik@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                kocacinarciftlik@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* 3. KOLON: Kurumsal & Yasal Linkler */}
        <div>
          <h3 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Kurumsal</h3>
          <ul className="flex flex-col gap-3 text-sm font-medium">
            <li>
              <Link href="/mesafeli-satis-sozlesmesi" className="text-gray-400 hover:text-[#D4A373] hover:pl-2 transition-all flex items-center gap-2">
                <span className="text-[#5e0d0f]">▪</span> Mesafeli Satış Sözleşmesi
              </Link>
            </li>
            <li>
              <Link href="/iptal-ve-iade" className="text-gray-400 hover:text-[#D4A373] hover:pl-2 transition-all flex items-center gap-2">
                <span className="text-[#5e0d0f]">▪</span> İptal ve İade Koşulları
              </Link>
            </li>
            <li>
              <Link href="/gizlilik-ve-kvkk" className="text-gray-400 hover:text-[#D4A373] hover:pl-2 transition-all flex items-center gap-2">
                <span className="text-[#5e0d0f]">▪</span> Gizlilik ve KVKK Metni
              </Link>
            </li>
          </ul>
        </div>

        {/* 4. KOLON: Güvenli Alışveriş (İyzico) */}
        <div>
          <h3 className="text-white font-bold tracking-widest uppercase mb-6 text-sm">Güvenli Alışveriş</h3>
          <p className="text-xs text-gray-500 mb-4">
            Tüm ödemeleriniz 256-bit SSL sertifikası ve İyzico güvencesi altındadır.
          </p>
          <div className="bg-white rounded-xl p-4 flex items-center justify-center shadow-inner hover:shadow-lg transition-shadow duration-300">
            <img 
              src="/iyzicoileode.png" 
              alt="İyzico ile Güvenli Ödeme" 
              className="w-full max-w-[180px] h-auto object-contain"
            />
          </div>
        </div>

      </div>

      {/* ALT BİLGİ & COPYRIGHT SÜTUNU */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} Koca Çınar Şarküteri. Tüm hakları saklıdır.</p>
        <p className="flex items-center gap-1">
          %100 Doğal <span className="text-[#D4A373]">|</span> %100 Güvenli
        </p>
      </div>
    </footer>
  );
}