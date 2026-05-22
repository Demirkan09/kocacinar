'use client';

import { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from 'react-icons/hi2';
import { FaWhatsapp } from "react-icons/fa";
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#5e0d0f] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl">
              🌳
            </div>
            <div>
              <a href="/anasayfa" className="font-bold text-3xl text-white hover:text-[#D4A373] transition">
                KOCA ÇINAR
              </a>
              <br />
              <a href="/anasayfa" className="font-medium text-sm text-[#D4A373]">
                Şarküteri
              </a>
            </div>
          </div>

          {/* Desktop Menü */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="/anasayfa" className="hover:text-[#D4A373] transition">Anasayfa</a>
            <a href="/hakkimizda" className="hover:text-[#D4A373] transition">Hakkımızda</a>
            <a href="/urunler" className="hover:text-[#D4A373] transition">Ürünlerimiz</a>
            <a href="/iletisim" className="hover:text-[#D4A373] transition">İletişim</a>
          </div>

          {/* Sağ Taraf */}
          <div className="flex items-center gap-4">
            {/* Desktop İkonlar */}
            <div className="hidden md:flex items-center gap-5">
              <button className="hover:text-[#D4A373] transition">
                <HiOutlineMagnifyingGlass size={24} />
              </button>
              <button className="hover:text-[#D4A373] transition">
                <HiOutlineUser size={24} />
              </button>
              <button className="relative hover:text-[#D4A373] transition">
                <HiOutlineShoppingBag size={24} />
                <span className="absolute -top-1 -right-1 bg-[#751113] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </button>
            </div>

            {/* WhatsApp Butonu - Sadece Desktop */}
            <a 
              href="https://wa.me/905513404848" 
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-md"
            >
              <FaWhatsapp size={20} />
              <span>Sipariş Ver</span>
            </a>

            {/* Hamburger */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-3xl"
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-white/20">
            <div className="flex flex-col gap-5 text-lg py-2">
              <a href="/anasayfa" className="hover:text-[#D4A373]" onClick={() => setIsMenuOpen(false)}>Anasayfa</a>
              <a href="/hakkimizda" className="hover:text-[#D4A373]" onClick={() => setIsMenuOpen(false)}>Hakkımızda</a>
              <a href="/urunler" className="hover:text-[#D4A373]" onClick={() => setIsMenuOpen(false)}>Ürünlerimiz</a>
              <a href="/iletisim" className="hover:text-[#D4A373]" onClick={() => setIsMenuOpen(false)}>İletişim</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}