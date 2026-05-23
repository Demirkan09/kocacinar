'use client';

import { useState, useEffect } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineShoppingBag,
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='));

    if (token) {
      try {
        const userData = JSON.parse(
          atob(token.split('=')[1].split('.')[1])
        );
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
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* MOBİL NAVBAR */}
        <div className="flex md:hidden items-center justify-between h-[78px]">
          
          {/* SOL */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-3xl text-white"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* ORTA LOGO + YAZI */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl">
              🌳
            </div>

            <div>
              <div className="font-bold text-[18px] leading-none tracking-wide">
                KOCA ÇINAR
              </div>

              <div className="text-[11px] text-[#D4A373] mt-1">
                Şarküteri
              </div>
            </div>
          </a>

          {/* SAĞ ICONLAR */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:text-[#D4A373] transition"
            >
              <HiOutlineMagnifyingGlass size={24} />
            </button>

            {user ? (
              <a
                href="/profil"
                className="hover:text-[#D4A373] transition"
              >
                <HiOutlineUser size={24} />
              </a>
            ) : (
              <a
                href="/login"
                className="hover:text-[#D4A373] transition"
              >
                <HiOutlineUser size={24} />
              </a>
            )}

            <a
              href="/sepet"
              className="relative hover:text-[#D4A373] transition"
            >
              <HiOutlineShoppingBag size={24} />

              <span className="absolute -top-1 -right-1 bg-[#751113] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </a>
          </div>
        </div>

        {/* DESKTOP NAVBAR */}
        <div className="hidden md:flex justify-between items-center py-4">
          
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl">
              🌳
            </div>

            <div>
              <a
                href="/"
                className="font-bold text-3xl text-white hover:text-[#D4A373] transition"
              >
                KOCA ÇINAR
              </a>

              <br />

              <a
                href="/"
                className="font-medium text-sm text-[#D4A373]"
              >
                Şarküteri
              </a>
            </div>
          </div>

          {/* MENÜ */}
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a
              href="/"
              className={`${
                pathname === '/'
                  ? 'text-[#D4A373] font-bold'
                  : 'hover:text-[#D4A373]'
              } transition`}
            >
              Anasayfa
            </a>

            <a
              href="/hakkimizda"
              className={`${
                pathname === '/hakkimizda'
                  ? 'text-[#D4A373] font-bold'
                  : 'hover:text-[#D4A373]'
              } transition`}
            >
              Hakkımızda
            </a>

            <a
              href="/urunler"
              className={`${
                pathname === '/urunler'
                  ? 'text-[#D4A373] font-bold'
                  : 'hover:text-[#D4A373]'
              } transition`}
            >
              Ürünlerimiz
            </a>

            <a
              href="/iletisim"
              className={`${
                pathname === '/iletisim'
                  ? 'text-[#D4A373] font-bold'
                  : 'hover:text-[#D4A373]'
              } transition`}
            >
              İletişim
            </a>
          </div>

          {/* SAĞ */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-5">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:text-[#D4A373] transition"
              >
                <HiOutlineMagnifyingGlass size={24} />
              </button>

              {user ? (
                <a
                  href="/profil"
                  className="hover:text-[#D4A373] transition"
                >
                  <HiOutlineUser size={24} />
                </a>
              ) : (
                <a
                  href="/login"
                  className="hover:text-[#D4A373] transition"
                >
                  <HiOutlineUser size={24} />
                </a>
              )}

              <a
                href="/sepet"
                className="relative hover:text-[#D4A373] transition"
              >
                <HiOutlineShoppingBag size={24} />

                <span className="absolute -top-1 -right-1 bg-[#751113] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  0
                </span>
              </a>
            </div>

            <a
              href="https://wa.me/905513404848"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-md"
            >
              <FaWhatsapp size={20} />
              <span>Sipariş Ver</span>
            </a>
          </div>
        </div>

        {/* SEARCH */}
        {isSearchOpen && (
          <div className="pb-4 pt-2 border-t border-white/10">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="w-full bg-[#4a0a0b] text-white placeholder-white/50 px-4 py-2 rounded-lg"
            />
          </div>
        )}

        {/* MOBİL MENU */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 pt-6 border-t border-white/20">
            <div className="flex flex-col gap-5 text-lg py-2">
              <a href="/" onClick={() => setIsMenuOpen(false)}>
                Anasayfa
              </a>

              <a
                href="/hakkimizda"
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </a>

              <a
                href="/urunler"
                onClick={() => setIsMenuOpen(false)}
              >
                Ürünlerimiz
              </a>

              <a
                href="/iletisim"
                onClick={() => setIsMenuOpen(false)}
              >
                İletişim
              </a>

              {user ? (
                <a
                  href="/profil"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profilim
                </a>
              ) : (
                <a
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap
                </a>
              )}

              <a
                href="https://wa.me/905513404848"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-3 rounded-full font-medium transition-all text-sm shadow-md mt-2"
              >
                <FaWhatsapp size={20} />
                <span>Sipariş Ver</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}