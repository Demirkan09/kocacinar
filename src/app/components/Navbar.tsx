'use client';

import { useState, useEffect } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineXMark,
  HiOutlineBars3
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
// Projendeki global sepet verisini dinlemek için doğru context yolunu bağlıyoruz
import { useCart } from '@/app/components/cart';

export default function Navbar() {
  const { cartCount } = useCart(); // Global sepet sayısını çektik kanka
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Kullanıcı Oturum Kontrolü
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

  // Aktif link kontrolü için yardımcı fonksiyon
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#5e0d0f]/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-xl border-b border-[#D4A373]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* ================= MOBİL NAVBAR ================= */}
        <div className="flex md:hidden items-center justify-between py-3">
          
          {/* SOL: Hamburger Menü */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 text-white hover:text-[#D4A373] transition-colors focus:outline-none"
            aria-label="Menüyü Aç"
          >
            {isMenuOpen ? <HiOutlineXMark size={28} /> : <HiOutlineBars3 size={28} />}
          </button>

          {/* ORTA: Logo */}
          <a href="/" className="flex flex-col items-center justify-center absolute left-1/2 -translate-x-1/2">
            <span className="font-extrabold text-xl tracking-widest text-white whitespace-nowrap">
              KOCA ÇINAR
            </span>
            <span className="text-[10px] font-medium tracking-widest text-[#D4A373] uppercase mt-0.5">
              Şarküteri
            </span>
          </a>

          {/* SAĞ: İkonlar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1 hover:text-[#D4A373] transition-colors"
            >
              <HiOutlineMagnifyingGlass size={22} />
            </button>

            <a href={user ? "/profil" : "/login"} className="p-1 hover:text-[#D4A373] transition-colors">
              <HiOutlineUser size={22} />
            </a>

            {/* MOBİL SEPET SAYACI */}
            <a href="/sepet" className="relative hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
              <HiOutlineShoppingBag size={22} />
              <span className="absolute -top-1.5 -right-2 bg-[#D4A373] text-[#5e0d0f] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            </a>
          </div>
        </div>

        {/* ================= DESKTOP NAVBAR ================= */}
        <div className="hidden md:flex justify-between items-center h-20">
          
          {/* LOGO */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-[#D4A373] rounded-full flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-105 transition-transform">
              🌳
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-wide text-white group-hover:text-[#D4A373] transition-colors">
                KOCA ÇINAR
              </span>
              <span className="text-xs font-semibold tracking-widest text-[#D4A373] uppercase">
                Şarküteri
              </span>
            </div>
          </a>

          {/* ORTA: Menü Linkleri (Modern Alt Çizgi Efekti) */}
          <div className="hidden lg:flex gap-8 text-sm font-medium">
            {[
              { name: 'Anasayfa', path: '/' },
              { name: 'Hakkımızda', path: '/hakkimizda' },
              { name: 'Ürünlerimiz', path: '/urunler' },
              { name: 'İletişim', path: '/iletisim' },
            ].map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`relative py-2 transition-colors ${
                  isActive(link.path) ? 'text-[#D4A373]' : 'text-gray-200 hover:text-white'
                } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-[#D4A373] after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 ${
                  isActive(link.path) ? 'after:scale-x-100' : ''
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* SAĞ: İkonlar ve Buton */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 border-r border-white/20 pr-5">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hover:text-[#D4A373] hover:scale-110 transition-all duration-200"
              >
                <HiOutlineMagnifyingGlass size={22} />
              </button>

              <a href={user ? "/profil" : "/login"} className="hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
                <HiOutlineUser size={22} />
              </a>

              {/* MASAÜSTÜ SEPET SAYACI (Hata Buradaydı, Düzeltildi kanka!) */}
              <a href="/sepet" className="relative hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
                <HiOutlineShoppingBag size={22} />
                <span className="absolute -top-1.5 -right-2 bg-[#D4A373] text-[#5e0d0f] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              </a>
            </div>

            <a
              href="https://wa.me/905513404848"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-lg hover:shadow-[#25D366]/40 hover:-translate-y-0.5"
            >
              <FaWhatsapp size={20} />
              <span>Sipariş Ver</span>
            </a>
          </div>
        </div>

        {/* ================= ARAMA KUTUSU (Açılır Kapanır) ================= */}
        {isSearchOpen && (
          <div className="pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="relative max-w-3xl mx-auto">
              <input
                type="text"
                placeholder="Canınız ne çekti? Arayın..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-5 py-3 rounded-xl outline-none focus:bg-white/20 focus:border-[#D4A373] transition-all shadow-inner"
                autoFocus
              />
              <HiOutlineMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
            </div>
          </div>
        )}

        {/* ================= MOBİL MENÜ ================= */}
        {isMenuOpen && (
          <div className="md:hidden animate-in fade-in slide-in-from-top-4 duration-300 pb-6 pt-4 border-t border-white/10">
            <div className="flex flex-col gap-2 text-lg px-2">
              {[
                { name: 'Anasayfa', path: '/' },
                { name: 'Hakkımızda', path: '/hakkimizda' },
                { name: 'Ürünlerimiz', path: '/urunler' },
                { name: 'İletişim', path: '/iletisim' },
              ].map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    isActive(link.path)
                      ? 'bg-[#D4A373]/20 text-[#D4A373] font-bold border border-[#D4A373]/30'
                      : 'text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              <div className="h-px bg-white/10 my-2 mx-4" />

              <a
                href="https://wa.me/905513404848"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white mx-4 mt-2 px-5 py-3.5 rounded-xl font-bold transition-all shadow-lg"
              >
                <FaWhatsapp size={22} />
                <span>WhatsApp ile Sipariş Ver</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}