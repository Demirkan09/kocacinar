'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { HiOutlineSparkles, HiOutlineTruck, HiOutlineShieldCheck, HiOutlineArrowRight, HiOutlineChatBubbleLeftRight, HiTrash } from "react-icons/hi2";

const heroImages = [
  '/arkaplan/hero1.jpg',
  '/arkaplan/hero2.jpg',
  '/arkaplan/hero3.jpg',
  '/arkaplan/hero4.jpg',
];

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number | null;
  image_url: string;
  category: string;
  unit: string;
  sort_order?: number;
  sort_onecikan?: number;
}

export default function Anasayfa() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Yönetim Modalı Stateleri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState('');

  // Sürükle-Bırak State Yapısı
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Hero Slider - Otomatik Geçiş
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Kategori Görsellerini Veritabanından Çekme
  const fetchCategoryImages = async () => {
    try {
      const res = await fetch('/api/categories/images');
      if (res.ok) {
        const data = await res.json();
        const imgMap: Record<string, string> = {};
        data.forEach((item: any) => {
          imgMap[item.category_name.toUpperCase()] = item.image_url;
        });
        setCategoryImages(imgMap);
      }
    } catch (err) {
      console.error("Kategori görselleri yüklenemedi:", err);
    }
  };

  // Ürünleri ve Kategorileri Çek
  const fetchProductsAndStatus = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      
      let productList: Product[] = Array.isArray(data) ? data : 
                                 data.rows || data.products || [];

      setProducts(productList);

      const uniqueCats = Array.from(new Set(
        productList.map((p: Product) => p.category).filter(Boolean)
      )).sort() as string[];

      setCategories(uniqueCats);
    } catch (err) {
      console.error("Ürünler yüklenemedi:", err);
    }
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        setIsAdmin(data?.user?.role === 'admin');
      } catch {
        setIsAdmin(false);
      }
    };

    fetchProductsAndStatus();
    checkAdmin();
    fetchCategoryImages();
  }, []);

  // Bilgisayardan Görsel Seçme İşlemi (Base64 Dönüştürücü)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Kategori Görselini Kaydetme
  const handleSaveCategoryImage = async () => {
    try {
      const res = await fetch('/api/categories/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: selectedCategory, image_url: modalImageUrl })
      });
      if (res.ok) {
        alert('Kategori görseli başarıyla güncellendi! ✅');
        setIsModalOpen(false);
        fetchCategoryImages();
      } else {
        alert('Bir hata oluştu kanka.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 🛠️ Ürünler sayfasını etkilememesi için artık 'sort_onecikan' kolonuna göre sıralayıp ilk 6'yı çekiyoruz
  const featuredProducts = [...products]
    .sort((a, b) => (a.sort_onecikan || 0) - (b.sort_onecikan || 0))
    .slice(0, 6);

  // Sürükle Bırak Fonksiyonları
  const handleDragStart = (index: number) => {
    if (!isAdmin) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
  };

  const handleDrop = async (dropIndex: number) => {
    if (!isAdmin || draggedIndex === null || draggedIndex === dropIndex) return;

    // Öne çıkanlar listesindeki yer değişimi kurgulanıyor
    const updatedFeatured = [...featuredProducts];
    const [draggedItem] = updatedFeatured.splice(draggedIndex, 1);
    updatedFeatured.splice(dropIndex, 0, draggedItem);

    // Ana products listesindeki öne çıkmayan diğer ürünleri ayırıyoruz
    const remainingProducts = products.filter(p => !featuredProducts.some(f => f.id === p.id));
    
    // Yeni birleşik listeyi state'e set ediyoruz
    const newAllProducts = [...updatedFeatured, ...remainingProducts];
    setProducts(newAllProducts);
    setDraggedIndex(null);

    // Veritabanına yeni sıralamayı özel API rotamız üzerinden gönderiyoruz
    const reorderData = updatedFeatured.map((p, i) => ({ id: p.id, sort_onecikan: i }));
    try {
      await fetch('/api/products/reorder-featured', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reorderData })
      });
    } catch (err) {
      console.error("Ana sayfada sıralama güncellenirken hata oluştu:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F0E6] text-[#3C2F2F] selection:bg-[#5e0d0f] selection:text-white overflow-hidden">
      
      {/* === DİNAMİK HERO SLIDER === */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {heroImages.map((img, index) => (
          <Image 
            key={index}
            src={img}
            alt={`Koca Çınar Şarküteri - ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 scale-105 ${
              index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-[#F5F0E6]" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center mt-12 md:mt-0">
          <span className="text-[#D4A373] font-bold tracking-[0.3em] text-xs md:text-sm uppercase mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 animate-pulse">
            🌿 Gelenekten Geleceğe Doğal Lezzet
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 tracking-tight leading-none drop-shadow-md">
            KOCA ÇINAR <br className="hidden md:block" />
            <span className="text-[#D4A373] bg-gradient-to-r from-[#D4A373] to-[#ffdaae] bg-clip-text text-transparent">ŞARKÜTERİ</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            Aydın'dan sofralarınıza; en taze, en doğal ve birinci kalite gurme şarküteri ürünleriyle geleneksel lezzetleri taşıyoruz.
          </p>
          
          <a href="/urunler" className="group relative inline-flex items-center justify-center bg-[#5e0d0f] text-white px-10 py-4 md:px-12 md:py-5 rounded-2xl text-base md:text-lg font-bold overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-[#5e0d0f]/50">
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative flex items-center gap-2">Alışverişe Başla <HiOutlineArrowRight size={20} /></span>
          </a>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
          {heroImages.map((_, index) => (
            <button key={index} onClick={() => setCurrentHeroIndex(index)} className={`transition-all duration-300 rounded-full ${index === currentHeroIndex ? 'bg-[#D4A373] w-8 h-2' : 'bg-white/60 w-2 h-2'}`} />
          ))}
        </div>
      </section>

      {/* === ÖZELLİKLER SECTION === */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#D4A373]/10 flex gap-5 items-center transform transition duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-2xl flex items-center justify-center text-[#5e0d0f] flex-shrink-0 shadow-inner">
              <HiOutlineSparkles size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#3C2F2F]">Günlük & Taze</h3>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">Ürünlerimiz her gün taze olarak özenle seçilir ve raflarda yerini alır.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#D4A373]/10 flex gap-5 items-center transform transition duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-2xl flex items-center justify-center text-[#5e0d0f] flex-shrink-0 shadow-inner">
              <HiOutlineShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#3C2F2F]">1. Kalite Garantisi</h3>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">Katkısız, doğal, sertifikalı ve doğrudan yöresinden seçilen lezzetler.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-[#D4A373]/10 flex gap-5 items-center transform transition duration-300 hover:-translate-y-1.5 hover:shadow-lg">
            <div className="w-14 h-14 bg-[#F5F0E6] rounded-2xl flex items-center justify-center text-[#5e0d0f] flex-shrink-0 shadow-inner">
              <HiOutlineTruck size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#3C2F2F]">Soğuk Zincir Teslimat</h3>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5 font-medium">Siparişleriniz tazeliği korunarak, soğuk zincir kırılmadan kapınıza gelir.</p>
            </div>
          </div>
        </div>
      </section>

      {/* === PREMIUM DIKEY GÖRSEL DESTEKLİ KATEGORİLER === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-28">
        <div className="text-center md:text-left mb-10">
          <span className="text-xs font-bold text-[#D4A373] tracking-widest uppercase block mb-1">Gurme Keşif</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#5e0d0f]">Kategorilere Göz Atın</h2>
          {isAdmin && <p className="text-amber-600 text-xs font-bold mt-1">💡 Yönetici Modu: Kartların üzerine tıklayarak kurumsal kapak görseli atayabilirsiniz.</p>}
          <div className="w-12 h-1 bg-[#D4A373] mt-3 rounded-full mx-auto md:mx-0"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const currentImg = categoryImages[cat.toUpperCase()] || '';
            
            return (
              <div 
                key={cat}
                onClick={() => {
                  if (isAdmin) {
                    setSelectedCategory(cat);
                    setModalImageUrl(currentImg);
                    setIsModalOpen(true);
                  } else {
                    window.location.href = `/urunler?kategori=${encodeURIComponent(cat)}`;
                  }
                }}
                className="relative h-80 rounded-[28px] overflow-hidden shadow-md group cursor-pointer border border-[#D4A373]/10 transition-all duration-500 hover:shadow-xl hover:scale-[1.02]"
              >
                {currentImg ? (
                  <img src={currentImg} alt={cat} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5e0d0f]/90 to-[#3d080a] flex flex-col items-center justify-center text-center p-4">
                    <span className="text-5xl mb-3">🧺</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:via-black/40 transition-colors duration-300" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-center z-10 flex flex-col items-center">
                  <h4 className="text-white font-extrabold text-base tracking-widest uppercase mb-2 drop-shadow-md">{cat}</h4>
                  <span className="text-[11px] font-bold text-[#D4A373] bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-xl uppercase tracking-wider border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    {isAdmin ? 'Görseli Düzenle ⚙️' : 'Ürünleri Gör ➔'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === ÖNE ÇIKAN ENFES LEZZETLER VİTRİNİ === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-28">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold text-[#D4A373] tracking-widest uppercase block mb-1">Haftanın Seçkisi</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#5e0d0f]">Öne Çıkan Ürünlerimiz</h2>
            {isAdmin && <p className="text-amber-600 text-xs font-bold mt-1">💡 Yönetici Modu: Kartları sürükleyip bırakarak ana sayfa vitrin sırasını (sort_onecikan) canlı değiştirebilirsiniz.</p>}
            <div className="w-12 h-1 bg-[#D4A373] mt-3 rounded-full mx-auto md:mx-0"></div>
          </div>
          <a href="/urunler" className="text-sm font-bold text-[#5e0d0f] bg-white border border-[#5e0d0f]/20 px-6 py-3 rounded-xl hover:bg-[#5e0d0f] hover:text-white transition-all flex items-center gap-2 group shadow-sm">
            Tüm Mağazayı Gör <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        {products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white h-80 rounded-3xl border border-gray-100"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => {
              const hasDiscount = product.old_price && product.old_price > product.price;
              const discountRate = hasDiscount ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100) : 0;

              return (
                <div 
                  key={product.id} 
                  draggable={isAdmin}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`bg-white rounded-[32px] border border-[#D4A373]/10 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                    isAdmin ? 'cursor-grab active:cursor-grabbing hover:border-[#D4A373]' : ''
                  } ${draggedIndex === index ? 'opacity-40 scale-95' : ''}`}
                >
                  {isAdmin && (
                    <div className="absolute top-0 right-0 left-0 bg-[#5e0d0f]/80 text-white text-[9px] text-center py-0.5 z-20 font-bold tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      VİTRİN SIRALAMASI İÇİN SÜRÜKLEYİN
                    </div>
                  )}

                  {/* Ürün Görsel Alanı */}
                  <div className="h-56 md:h-64 w-full relative overflow-hidden rounded-t-[32px]">
                    {hasDiscount && (
                      <span className="absolute top-4 left-4 z-10 bg-red-700 text-white font-extrabold text-[10px] tracking-wider px-3 py-1.5 rounded-xl uppercase shadow-sm">
                        %{discountRate} İNDİRİM
                      </span>
                    )}

                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FBF9F4] flex items-center justify-center text-5xl">🧀</div>
                    )}
                  </div>

                  {/* Detaylar Alanı */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#D4A373] tracking-wider uppercase block">{product.category}</span>
                      <h3 className="font-bold text-[#3C2F2F] text-sm md:text-base truncate group-hover:text-[#5e0d0f] transition-colors">{product.name}</h3>
                      <p className="text-gray-400 text-xs font-medium">Birim: 1 {product.unit}</p>
                      
                      <div className="flex items-baseline gap-2 pt-2 border-t border-gray-50 mt-2">
                        <span className="text-lg font-extrabold text-[#5e0d0f]">₺{product.price}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-400 line-through font-medium">₺{product.old_price}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1">
                      <a 
                        href="/urunler" 
                        className="w-full bg-[#5e0d0f]/5 text-[#5e0d0f] group-hover:bg-[#5e0d0f] group-hover:text-white transition-all duration-300 font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 shadow-inner"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg> 
                        Sepete Ekle / İncele
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* === KOCA ÇINAR GURME HİKAYESİ === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-28">
        <div className="bg-gradient-to-br from-[#5e0d0f] to-[#3d080a] rounded-[40px] text-white p-8 md:p-16 flex flex-col lg:flex-row items-center gap-12 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,163,115,0.15),transparent)] pointer-events-none" />
          
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <span className="text-[#D4A373] font-extrabold tracking-widest uppercase text-xs block">Biz Kimiz?</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">Yüzyıllık Çınarın Gölgesinde <br />Doğal ve Katkısız Üretim</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed font-light">Koca Çınar Şarküteri olarak, her bir lokmada memleketimizin bereketli topraklarının kokusunu hissettirmeyi amaçlıyoruz. Kendi üretimimiz olan peynirlerden, yöresinden seçilen zeytinlere kadar her şey "gerçek gıda" prensibimizle sofranıza ulaşır. </p>
          </div>

{/* 🛠️ Beyaz kare kaldırıldı, şeffaf ve pürüzsüz logo alanı kurgulandı */}
          <div className="w-full lg:w-96 h-64 md:h-80 relative flex items-center justify-center flex-shrink-0">
            {/* Arka plandaki lüks gold dokunuş katmanı dairesel parıltı olarak logonun arkasına alındı */}
            <div className="absolute w-72 h-72 bg-[#D4A373]/10 rounded-full blur-2xl pointer-events-none z-0" />
            
            {/* 🌲 Kurumsal Logo - Arka planı tamamen şeffaf olarak zemine işlendi */}
            <div className="w-full h-full relative z-10">
              <Image
                src="/kocacinarlogo.png"
                alt="Koca Çınar Çiftliği Logo"
                fill
                sizes="(max-w-width: 1024px) 100vw, 384px" // ➔ Performans uyarısını çözen sihirli satır
                className="object-contain p-4 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* === GURME YORUMLARI === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#D4A373] tracking-widest uppercase block mb-1">Müşteri Deneyimleri</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#5e0d0f] flex items-center justify-center gap-2"><HiOutlineChatBubbleLeftRight size={32} className="text-[#D4A373]" /> Gurmelerimiz Ne Diyor?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Ahmet Yılmaz', text: '"Eski kaşar ve süzme süzme yoğurt aldım, köy lezzeti."', init: 'A.Y' },
            { name: 'Zeynep Kaya', text: '"Tereyağ kesinlikle doğal, tekrar sipariş edeceğim."', init: 'Z.K' },
            { name: 'Mehmet Aslan', text: '"Yeşil kırma zeytin tam bir efsane. Katkısız olduğu belli."', init: 'M.A' }
          ].map((u, i) => (
            <div key={i} className="bg-white p-6 md:p-8 rounded-3xl border border-[#D4A373]/10 shadow-sm">
              <div className="flex text-amber-400 text-lg mb-4">★★★★★</div>
              <p className="text-gray-600 text-sm italic font-medium leading-relaxed">{u.text}</p>
              <div className="border-t border-gray-100 mt-6 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#5e0d0f]/10 rounded-full flex items-center justify-center font-bold text-[#5e0d0f] text-sm">{u.init}</div>
                <div><h5 className="font-bold text-sm text-[#3C2F2F]">{u.name}</h5><p className="text-[10px] text-gray-400">Doğrulanmış Müşteri</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === ⚙️ ADMİN KATEGORİ GÖRSEL YÖNETİM MODAL === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[28px] p-6 shadow-2xl border border-[#D4A373]/20 flex flex-col gap-4 animate-in zoom-in-95 duration-300">
            <div>
              <h3 className="text-lg font-extrabold text-[#5e0d0f] uppercase tracking-wide">Kapak Görseli Düzenle</h3>
              <p className="text-xs text-gray-400 font-bold">Kategori: <span className="text-[#3C2F2F]">{selectedCategory}</span></p>
            </div>

            <div className="h-44 w-full bg-gray-50 border rounded-2xl overflow-hidden relative flex items-center justify-center">
              {modalImageUrl ? (
                <img src={modalImageUrl} alt="Önizleme" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 font-bold">Resim Seçilmedi veya Link Girilmedi</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Görsel URL (İnternet Linki)</label>
              <input 
                type="text" 
                placeholder="https://...jpg"
                value={modalImageUrl} 
                onChange={(e) => setModalImageUrl(e.target.value)}
                className="w-full border-2 border-gray-100 p-3 rounded-xl text-xs font-medium text-[#3C2F2F] outline-none focus:border-[#D4A373]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Veya Bilgisayardan Dosya Seç</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#D4A373]/10 file:text-[#5e0d0f] hover:file:bg-[#D4A373]/20 cursor-pointer"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <button 
                onClick={() => {
                  if (confirm('Kapak görselini tamamen kaldırmak istediğinize emin misiniz?')) {
                    setModalImageUrl('');
                  }
                }}
                className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-colors text-sm font-bold flex items-center gap-1"
                title="Görseli Kaldır"
              >
                <HiTrash size={18} /> Kaldır
              </button>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl font-bold text-xs text-gray-500 hover:bg-gray-100">İptal</button>
                <button onClick={handleSaveCategoryImage} className="bg-[#5e0d0f] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#D4A373] shadow-md transition-all active:scale-95">Değişiklikleri Kaydet</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}