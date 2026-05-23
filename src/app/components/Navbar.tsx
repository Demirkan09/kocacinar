'use client';

import { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineUser, HiOutlineShoppingBag } from 'react-icons/hi2';
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth-token='));
    if (token) {
      try {
        const userData = JSON.parse(atob(token.split('=')[1].split('.')[1]));
        setUser(userData);
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    document.cookie = 'auth-token=; path=/; max-age=0';
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-[#5e0d0f] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl">
              🌳
            </div>
            <div>
              <a href="/" className="font-bold text-3xl text-white hover:text-[#D4A373] transition">
                KOCA ÇINAR
              </a>
              <br />
              <a href="/" className="font-medium text-sm text-[#D4A373]">
                Şarküteri
              </a>
            </div>
          </div>

          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="/" className="hover:text-[#D4A373] transition">Anasayfa</a>
            <a href="/hakkimizda" className="hover:text-[#D4A373] transition">Hakkımızda</a>
            <a href="/urunler" className="hover:text-[#D4A373] transition">Ürünlerimiz</a>
            <a href="/iletisim" className="hover:text-[#D4A373] transition">İletişim</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-[#D4A373] transition">
                <HiOutlineMagnifyingGlass size={24} />
              </button>

              {user ? (
                <a href="/profil" className="hover:text-[#D4A373] transition">
                  <HiOutlineUser size={24} />
                </a>
              ) : (
                <a href="/login" className="hover:text-[#D4A373] transition">
                  <HiOutlineUser size={24} />
                </a>
              )}

              <a href="/sepet" className="relative hover:text-[#D4A373] transition">
                <HiOutlineShoppingBag size={24} />
                <span className="absolute -top-1 -right-1 bg-[#751113] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </a>
            </div>

            <a href="https://wa.me/905513404848" target="_blank" rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-md">
              <FaWhatsapp size={20} />
              <span>Sipariş Ver</span>
            </a>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-3xl">
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div className="mt-4 pt-2 border-t border-white/10">
            <input type="text" placeholder="Ürün ara..." className="w-full bg-[#4a0a0b] text-white placeholder-white/50 px-4 py-2 rounded-lg" />
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden mt-6 pt-6 border-t border-white/20">
            <div className="flex flex-col gap-5 text-lg py-2">
              <a href="/" onClick={() => setIsMenuOpen(false)}>Anasayfa</a>
              <a href="/hakkimizda" onClick={() => setIsMenuOpen(false)}>Hakkımızda</a>
              <a href="/urunler" onClick={() => setIsMenuOpen(false)}>Ürünlerimiz</a>
              <a href="/iletisim" onClick={() => setIsMenuOpen(false)}>İletişim</a>
              {user ? (
                <a href="/profil" onClick={() => setIsMenuOpen(false)}>Profilim</a>
              ) : (
                <a href="/login" onClick={() => setIsMenuOpen(false)}>Giriş Yap</a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}