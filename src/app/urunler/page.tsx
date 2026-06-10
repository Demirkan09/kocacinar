'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/components/cart';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlineTruck, 
  HiOutlineShieldCheck, 
  HiOutlineArrowRight, 
  HiOutlineChatBubbleLeftRight 
} from "react-icons/hi2";

interface Product {
  id: number;
  name: string;
  price: number;
  old_price?: number | null; 
  image_url: string;
  category: string;
  unit: string; 
  sort_order?: number;
}

function UrunlerPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('HEPSİ');
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';
  
  // Sürükle-Bırak için State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  // Yükleniyor Durumu State'i
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Kategori Kaydırma Ref'i
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Kategoriler State (Veritabanından çekilip güncellenecek)
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState({ 
    name: '', price: '', old_price: '', image_url: '', category: '', unit: 'kg' 
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  // Seçilen resmi Base64 formatına dönüştüren fonksiyon
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        alert("Yüklemek istediğiniz resim çok büyük! Lütfen 2MB'tan küçük bir görsel seçiniz.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Sayfa ilk yüklendiğinde hem ürünleri hem kategorileri veritabanından çekiyoruz kanka
  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true);

        // 1. Veritabanından Kategorileri Çek
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) {
            setCategories(catData);
            setFormData(prev => ({ ...prev, category: catData[0] || 'PEYNİR' }));
          }
        }

        // 2. Veritabanından Ürünleri Çek
        const prodRes = await fetch('/api/products');
        if (!prodRes.ok) throw new Error('Ürünler yüklenirken hata oluştu.');
        const prodData = await prodRes.json();
        
        if (Array.isArray(prodData)) setProducts(prodData);
        else if (prodData && Array.isArray(prodData.products)) setProducts(prodData.products);
        else if (prodData && typeof prodData === 'object') {
          const possibleArray = prodData.rows || prodData.data;
          if (Array.isArray(possibleArray)) setProducts(possibleArray);
        }
      } catch (err) {
        console.error("Veriler alınırken hata oluştu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data?.user?.role === 'admin') setIsAdmin(true);
      } catch (err) { setIsAdmin(false); }
    };

    checkAdminStatus();
    fetchCategoriesAndProducts();
  }, []);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // ✅ Veritabanına Yeni Kategori Ekleme Fonksiyonu
  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') return;
    const formattedCat = newCategoryName.trim().toUpperCase();
    
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formattedCat })
      });
      const data = await res.json();

      if (data.success) {
        setCategories([...categories, formattedCat]);
        setFormData({ ...formData, category: formattedCat });
        setNewCategoryName('');
      } else {
        alert(data.error || "Kategori eklenirken bir hata oluştu.");
      }
    } catch (err) {
      console.error("Kategori eklenemedi:", err);
    }
  };

  // ✅ Veritabanında Kategorileri Sıralama Fonksiyonu
  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    if (direction === 'up' && index > 0) {
      [newCats[index - 1], newCats[index]] = [newCats[index], newCats[index - 1]];
    } else if (direction === 'down' && index < newCats.length - 1) {
      [newCats[index + 1], newCats[index]] = [newCats[index], newCats[index + 1]];
    }

    setCategories(newCats);

    try {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items: newCats })
      });
    } catch (err) {
      console.error("Sıralama veritabanına kaydedilemedi:", err);
    }
  };

  // ✅ Veritabanından Kategori Silme Fonksiyonu
  const handleDeleteCategory = async (cat: string) => {
    if (categories.length <= 1) return alert("En az bir kategori bulunmalıdır!");
    if (!confirm(`"${cat}" kategorisini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat })
      });
      const data = await res.json();

      if (data.success) {
        setCategories(categories.filter(c => c !== cat));
        if (selectedCategory === cat) setSelectedCategory('HEPSİ');
      } else {
        alert(data.error || "Kategori silinemedi.");
      }
    } catch (err) {
      console.error("Kategori silme hatası:", err);
    }
  };

  const handleDragStart = (index: number) => { setDraggedIndex(index); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  
  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const draggedProduct = filteredProducts[draggedIndex];
    const targetProduct = filteredProducts[dropIndex];

    if (!draggedProduct || !targetProduct) return;

    const mainDraggedIdx = products.findIndex(p => p.id === draggedProduct.id);
    const mainTargetIdx = products.findIndex(p => p.id === targetProduct.id);

    if (mainDraggedIdx === -1 || mainTargetIdx === -1) return;

    const newProducts = [...products];
    newProducts.splice(mainDraggedIdx, 1);
    newProducts.splice(mainTargetIdx, 0, draggedProduct);

    setProducts(newProducts);
    setDraggedIndex(null);

    const reorderData = newProducts.map((p, i) => ({ id: p.id, sort_order: i }));
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', items: reorderData })
      });
    } catch (err) { 
      console.error("Sıralama kaydedilemedi", err); 
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Kalıcı olarak silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if ((await res.json()).success) {
        setProducts(products.filter(p => p.id !== id));
        setIsModalOpen(false);
      }
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestPayload: any = {
      name: formData.name,
      price: formData.price,
      old_price: formData.old_price,
      image_url: formData.image_url, 
      category: formData.category || categories[0],
      unit: formData.unit || 'kg'
    };

    if (editingProduct) {
      requestPayload.id = editingProduct.id.toString();
    }

    try {
      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      
      const data = await res.json();
      if (data.success) {
        if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        else setProducts([data.product, ...products]);
        setIsModalOpen(false);
        setFormData({ name: '', price: '', old_price: '', image_url: '', category: categories[0], unit: 'kg' });
      } else {
        alert(`Hata: ${data.error || 'Ürün kaydedilemedi.'}`);
      }
    } catch (err) {
      console.error("Form gönderme hatası:", err);
      alert("Canlı sunucu bağlantısında hata oluştu.");
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, price: product.price.toString(), old_price: product.old_price ? product.old_price.toString() : '',
        image_url: product.image_url, category: product.category || categories[0], unit: product.unit || 'kg'
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', old_price: '', image_url: '', category: categories[0], unit: 'kg' });
    }
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'HEPSİ' || product.category?.toUpperCase() === selectedCategory.toUpperCase();
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Başlık alanı */}
        <div className="text-center mb-10 relative">
          <span className="text-[#D4A373] font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Seçkin Koleksiyon</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#5e0d0f] mb-4">Ürünlerimiz</h1>
          <div className="w-20 h-1 bg-[#D4A373] mx-auto rounded-full mb-6"></div>
          
          {isAdmin && (
            <button onClick={() => openModal(null)} className="inline-flex items-center gap-2 bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-sm">
              <span className="text-lg">✚</span> Yönetici: Yeni Ürün Ekle
            </button>
          )}
        </div>

        {/* Kaydırılabilir Dinamik Kategori Çubuğu */}
        <div className="w-full mb-12 border-b border-[#D4A373]/20 pb-4 relative group max-w-full">
          <button onClick={() => scrollCategory('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-[#D4A373]/30 rounded-full shadow-md flex items-center justify-center text-[#5e0d0f] hover:bg-[#D4A373] hover:text-white transition-all md:opacity-0 group-hover:opacity-100 -ml-4 hidden md:flex font-bold">
            &lt;
          </button>

          <div ref={categoryScrollRef} className="flex items-center gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth py-2 px-1 -mx-4 md:mx-0 px-4 md:px-0" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory('HEPSİ')}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                selectedCategory === 'HEPSİ' ? 'bg-[#5e0d0f] text-white shadow-[#5e0d0f]/20' : 'bg-white text-[#3C2F2F] border border-[#D4A373]/20 hover:border-[#5e0d0f]'
              }`}
            >
              🌿 HEPSİ
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                  selectedCategory === cat ? 'bg-[#5e0d0f] text-white shadow-[#5e0d0f]/20' : 'bg-white text-[#3C2F2F] border border-[#D4A373]/20 hover:border-[#5e0d0f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button onClick={() => scrollCategory('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-[#D4A373]/30 rounded-full shadow-md flex items-center justify-center text-[#5e0d0f] hover:bg-[#D4A373] hover:text-white transition-all md:opacity-0 group-hover:opacity-100 -mr-4 hidden md:flex font-bold">
            &gt;
          </button>
        </div>

        {/* Ürünler Grid Yapısı / Yükleniyor Ekranı */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4A373]/10 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#5e0d0f] rounded-full animate-spin"></div>
            <div className="text-lg font-bold text-[#3C2F2F] tracking-wide animate-pulse">
              Ürünler ve kategoriler yükleniyor, lütfen bekleyiniz...
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4A373]/10 shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-bold text-[#3C2F2F]">Aradığınız kriterlere uygun ürün bulunmuyor.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product, index) => {
              let discountPercent = 0;
              if (product.old_price && Number(product.old_price) > Number(product.price)) {
                discountPercent = Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100);
              }

              return (
                <div 
                  key={product.id}
                  draggable={isAdmin}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`group bg-white rounded-[2rem] overflow-hidden shadow-sm border border-[#D4A373]/10 flex flex-col justify-between transition-all duration-300 relative ${isAdmin ? 'cursor-grab active:cursor-grabbing hover:border-[#D4A373] hover:shadow-xl' : 'hover:shadow-xl hover:-translate-y-1'} ${draggedIndex === index ? 'opacity-40 scale-95' : ''}`}
                >
                  {isAdmin && (
                    <div className="absolute top-0 right-0 left-0 bg-[#5e0d0f]/80 text-white text-[9px] text-center py-0.5 z-20 font-bold tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      SIRALAMAK İÇİN SÜRÜKLEYİN
                    </div>
                  )}

                  <div className="h-52 md:h-60 w-full relative overflow-hidden rounded-t-[2rem]">
                    {discountPercent > 0 && (
                      <div className="absolute top-3 left-3 bg-[#5e0d0f] text-[#F5F0E6] text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md z-10 tracking-wider">
                        %{discountPercent} İNDİRİM
                      </div>
                    )}
                    {isAdmin && (
                      <div onClick={() => openModal(product)} className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#5e0d0f] text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 z-10 cursor-pointer hover:bg-[#5e0d0f] hover:text-white transition-colors">
                        <span>✎</span> Düzenle
                      </div>
                    )}
                    
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FBF9F4] flex items-center justify-center text-5xl">🧀</div>
                    )}
                  </div>

                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#D4A373] tracking-wider uppercase block">{product.category}</span>
                      <h3 className="font-bold text-[#3C2F2F] text-sm md:text-base truncate group-hover:text-[#5e0d0f] transition-colors">{product.name}</h3>
                      <p className="text-gray-400 text-xs font-medium">1 {product.unit} Fiyatı</p>
                      
                      <div className="flex items-baseline gap-2 pt-2 border-t border-gray-50 mt-2">
                        <span className="text-lg md:text-xl font-extrabold text-[#5e0d0f]">₺{product.price}</span>
                        {product.old_price && Number(product.old_price) > Number(product.price) && (
                          <span className="text-xs text-gray-400 line-through font-medium">₺{product.old_price}</span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, category: product.category, unit: product.unit })}
                      className="w-full bg-[#5e0d0f] hover:bg-[#3d080a] text-white transition-all duration-300 font-bold text-xs md:text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg> 
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Panel Modal Düzenlemesi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3C2F2F]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-[#5e0d0f]">{editingProduct ? 'Ürünü Düzenle' : 'Yönetim Paneli'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>

            {/* GERÇEK DİNAMİK KATEGORİ PANELİ */}
            <div className="mb-8 p-5 bg-[#FBF9F4] border border-[#D4A373]/30 rounded-2xl">
              <h4 className="text-sm font-bold text-[#5e0d0f] uppercase tracking-widest mb-3">Kategorileri Yönet (Canlı)</h4>
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Yeni Kategori Adı..." className="flex-1 bg-white border border-[#D4A373]/20 rounded-xl px-3 text-sm focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]"
                />
                <button type="button" onClick={handleAddCategory} className="bg-green-600 text-white px-4 rounded-xl font-bold text-sm">+</button>
              </div>
              
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                {categories.map((cat, index) => (
                  <div key={cat} className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-xl">
                    <span className="font-bold text-xs text-[#3C2F2F]">{cat}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveCategory(index, 'up')} disabled={index === 0} className="w-7 h-7 bg-gray-50 rounded text-lg hover:bg-gray-200 disabled:opacity-30">⬆️</button>
                      <button type="button" onClick={() => moveCategory(index, 'down')} disabled={index === categories.length - 1} className="w-7 h-7 bg-gray-50 rounded text-lg hover:bg-gray-200 disabled:opacity-30">⬇️</button>
                      <button type="button" onClick={() => handleDeleteCategory(cat)} className="w-7 h-7 bg-red-50 text-red-500 rounded text-xs hover:bg-red-100 font-bold">X</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Ürün Adı</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#D4A373] transition-all outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Kategori</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#D4A373] transition-all outline-none">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#5e0d0f] uppercase tracking-widest px-1 block mb-1">Satış Fiyatı (₺)</label>
                  <input type="number" required step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#5e0d0f] outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 block mb-1">İndirimsiz Fiyat (₺)</label>
                  <input type="number" step="0.01" value={formData.old_price} onChange={e => setFormData({...formData, old_price: e.target.value})} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-gray-300 outline-none" placeholder="Opsiyonel" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Birim Seçimi</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#D4A373] transition-all outline-none">
                    <option value="kg">Kilogram (kg)</option><option value="Litre">Litre (L)</option><option value="Adet">Adet</option><option value="Paket">Paket</option><option value="Gram">Gram (g)</option>
                  </select>
                </div>
              </div>

              <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4A373]/20 file:text-[#5e0d0f] hover:file:bg-[#D4A373]/30 transition-all cursor-pointer mb-3" />
                <input type="text" value={formData.image_url.startsWith('data:') ? 'Görsel Başarıyla Yüklendi (Base64 Mode)' : formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} disabled={formData.image_url.startsWith('data:')} className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#D4A373] outline-none disabled:bg-gray-100 disabled:text-green-600 disabled:font-bold" placeholder="Veya Resim URL Girin (https://...)" />
                {formData.image_url.startsWith('data:') && (
                  <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="text-[10px] text-red-500 hover:underline mt-1 block pl-1">Resmi Kaldır</button>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" className="w-full bg-[#5e0d0f] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#D4A373] transition-all">
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => handleDeleteProduct(editingProduct.id)} className="w-full border-2 border-red-100 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm">
                    Ürünü Sil
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UrunlerPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center font-sans text-[#5e0d0f] font-bold">
        Yükleniyor...
      </div>
    }>
      <UrunlerPage />
    </Suspense>
  );
}