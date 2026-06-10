'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  HiOutlineMagnifyingGlass,
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineXMark,
  HiOutlineBars3
} from 'react-icons/hi2';
import { FaWhatsapp } from 'react-icons/fa';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCart } from '@/app/components/cart';

export default function Navbar() {
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
 
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      router.replace(`/urunler?q=${encodeURIComponent(val)}`);
    } else {
      if (pathname === '/urunler') {
        router.replace('/urunler');
      }
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth-token='));
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

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-[#5e0d0f]/95 backdrop-blur-md text-white sticky top-0 z-50 shadow-xl border-b border-[#D4A373]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
       
        {/* ================= MOBİL NAVBAR (LOGO DÜZELTİLMİŞ) ================= */}
        <div className="flex md:hidden items-center justify-between py-4">   {/* py-3 → py-4 yaptık */}
         
          {/* SOL: Hamburger Menü */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -ml-2 text-white hover:text-[#D4A373] transition-colors focus:outline-none"
            aria-label="Menüyü Aç"
          >
            {isMenuOpen ? <HiOutlineXMark size={28} /> : <HiOutlineBars3 size={28} />}
          </button>

          {/* ORTA: LOGO - BÜYÜTÜLDÜ ve Daha İyi Ortalandı */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Image
              src="/kocacinarlogo.png"
              alt="Koca Çınar Şarküteri"
              width={130}
              height={130}
              priority
              className="object-contain drop-shadow-lg"
              style={{ width: '110px', height: 'auto' }}
            />
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
            <a href="/sepet" className="relative hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
              <HiOutlineShoppingBag size={22} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D4A373] text-[#5e0d0f] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in scale-in duration-200">
                  {cartCount}
                </span>
              )}
            </a>
          </div>
        </div>
        
        {/* ================= DESKTOP NAVBAR (Değişmedi) ================= */}
        <div className="hidden md:flex justify-between items-center h-20">
          <a href="/" className="flex items-center gap-3 md:gap-4 group">
            <div className="relative transform group-hover:scale-105 transition-transform flex items-center">
              <Image
                src="/kocacinarlogo.png"
                alt="Koca Çınar Logo"
                width={110}
                height={110}
                priority
                className="object-contain drop-shadow-lg w-[70px] md:w-[110px]"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl md:text-3xl tracking-wide text-white group-hover:text-[#D4A373] transition-colors">
                KOCA ÇINAR
              </span>
              <span className="text-[11px] md:text-xs font-bold tracking-widest text-[#D4A373] uppercase mt-0.5">
                Şarküteri
              </span>
            </div>
          </a>

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

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 border-r border-white/20 pr-5">
              <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
                <HiOutlineMagnifyingGlass size={22} />
              </button>
              <a href={user ? "/profil" : "/login"} className="hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
                <HiOutlineUser size={22} />
              </a>
              <a href="/sepet" className="relative hover:text-[#D4A373] hover:scale-110 transition-all duration-200">
                <HiOutlineShoppingBag size={22} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#D4A373] text-[#5e0d0f] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-in scale-in duration-200">
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
            <a href="https://wa.me/905513404848" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20C25A] text-white px-5 py-2.5 rounded-full font-medium transition-all text-sm shadow-lg hover:shadow-[#25D366]/40 hover:-translate-y-0.5">
              <FaWhatsapp size={20} />
              <span>Sipariş Ver</span>
            </a>
          </div>
        </div>

        {/* ================= CANLI ARAMA KUTUSU ================= */}
        {isSearchOpen && (
          <div className="pb-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={(e) => e.preventDefault()} className="relative max-w-3xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="İstediğiniz ürünü arayın..."
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 px-5 py-3 rounded-xl outline-none focus:bg-white/20 focus:border-[#D4A373] transition-all shadow-inner"
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none">
                <HiOutlineMagnifyingGlass size={20} />
              </div>
            </form>
          </div>
        )}

        {/* ================= YENİ MOBİL MENÜ (Premium & Naif) ================= */}
        {isMenuOpen && (
          <div className="md:hidden animate-in fade-in slide-in-from-top-4 duration-300 pb-8 pt-4 border-t border-white/10">
            <div className="flex flex-col px-4 text-lg">
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
                  className={`py-4 px-5 rounded-2xl transition-all duration-300 flex items-center group
                    ${isActive(link.path)
                      ? 'text-[#D4A373] font-semibold bg-white/5'
                      : 'text-gray-200 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <span className="relative">
                    {link.name}
                    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#D4A373] transition-all duration-300
                      ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`} 
                    />
                  </span>
                </a>
              ))}

              <div className="h-px bg-white/10 my-4 mx-5" />

              <a
                href="https://wa.me/905513404848"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20C25A] text-white mx-4 mt-2 px-6 py-4 rounded-2xl font-semibold transition-all shadow-lg text-base"
              >
                <FaWhatsapp size={24} />
                WhatsApp ile Sipariş Ver
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}