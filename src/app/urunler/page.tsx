'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/app/components/cart';
interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  unit: string; // Soru işaretini (?) kaldırdık, boş gelse bile string olacak dedik
}

export default function UrunlerPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Aktif filtrelenen kategori state'i ("HEPSİ" varsayılan)
  const [selectedCategory, setSelectedCategory] = useState<string>('HEPSİ');
  
  const [categories, setCategories] = useState<string[]>([
    'PEYNİR', 'ZEYTİN', 'SÜT ÜRÜNLERİ', 'ET ÜRÜNLERİ', 'KAHVALTILIK', 'BAL & REÇEL', 'ŞARKÜTERİ', 'MEZE'
  ]);

const [formData, setFormData] = useState({ 
  name: '', 
  price: '', 
  image_url: '', 
  category: 'PEYNİR',
  unit: 'kg' 
});

  // 1. Ürün Verilerinin ve Kullanıcı Yetkilerinin Alınması
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Ürünler yüklenirken hata oluştu.');
        
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && typeof data === 'object') {
          const possibleArray = data.rows || data.data;
          if (Array.isArray(possibleArray)) setProducts(possibleArray);
        }
      } catch (err) {
        console.error("Ürün listesi alınırken hata oluştu:", err);
      }
    };

    const checkAdminStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data && data.user && data.user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("Admin kontrolü hatası:", err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
    fetchProducts();
  }, []);

  // 2. ÜRÜN SİLME FONKSİYONU
  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Bu ürünü kalıcı olarak silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
        setIsModalOpen(false);
      } else {
        alert(data.error || "Silme işlemi başarısız.");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    }
  };

  // 3. KAYDET / GÜNCELLEME FONKSİYONU
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('image_url', formData.image_url);
    formDataToSend.append('category', formData.category || categories[0]);
    formDataToSend.append('unit', formData.unit || 'kg');
    
    if (selectedFile) {
      formDataToSend.append('file', selectedFile);
    }
    if (editingProduct) {
      formDataToSend.append('id', editingProduct.id.toString());
    }

    try {
      const url = '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      const data = await res.json();
      if (data.success) {
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        
        setIsModalOpen(false);
        setSelectedFile(null);
        setFormData({ name: '', price: '', image_url: '', category: categories[0], unit: 'kg' });
      } else {
        alert(data.error || "İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
      alert("Sistemsel bir hata oluştu.");
    }
  };

  // 4. Kategori Ekleme / Silme Fonksiyonları
  const handleAddCategory = () => {
    const newCat = window.prompt("Yeni kategori adını girin (Örn: BAHARATLAR):");
    if (newCat && newCat.trim() !== '') {
      const formattedCat = newCat.trim().toUpperCase();
      if (!categories.includes(formattedCat)) {
        setCategories([...categories, formattedCat]);
        setFormData({ ...formData, category: formattedCat });
      } else {
        alert("Bu kategori zaten mevcut!");
      }
    }
  };

  const handleDeleteCategory = () => {
    if (categories.length <= 1) {
      alert("En az bir kategori bulunmalıdır!");
      return;
    }
    if (window.confirm(`"${formData.category}" kategorisini listeden silmek istediğinize emin misiniz?`)) {
      const updatedCategories = categories.filter(c => c !== formData.category);
      setCategories(updatedCategories);
      setFormData({ ...formData, category: updatedCategories[0] });
    }
  };

  // 5. Ürün Ekleme veya Düzenleme Penceresinin Açılması
  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        price: product.price.toString(), 
        image_url: product.image_url,
        category: product.category || categories[0],
        unit: product.unit || 'kg'
      });
      if (product.category && !categories.includes(product.category)) {
        setCategories([...categories, product.category]);
      }
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', image_url: '', category: categories[0], unit: 'kg' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  // 6. FİLTRELEME MANTIĞI
  const filteredProducts = selectedCategory === 'HEPSİ'
    ? products
    : products.filter(product => product.category?.toUpperCase() === selectedCategory.toUpperCase());

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ================= BAŞLIK VE ADMİN BUTONU ================= */}
        <div className="text-center mb-10 relative">
          <span className="text-[#D4A373] font-bold uppercase tracking-[0.2em] text-xs mb-3 block">Seçkin Koleksiyon</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#5e0d0f] mb-4">Ürünlerimiz</h1>
          <div className="w-20 h-1 bg-[#D4A373] mx-auto rounded-full mb-6"></div>
          
          {isAdmin && (
            <button 
              onClick={() => openModal(null)}
              className="inline-flex items-center gap-2 bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold px-8 py-3.5 rounded-full shadow-lg transition-all duration-300 hover:shadow-[#D4A373]/30 active:scale-95 text-sm"
            >
              <span className="text-lg">✚</span> Yeni Ürün Ekle
            </button>
          )}
        </div>

        {/* ================= YAN YANA KAYDIRILABİLİR PREMIUM KATEGORİ PANELİ ================= */}
        <div className="w-full mb-12 border-b border-[#D4A373]/20 pb-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 -mx-4 md:mx-0 px-4 md:px-0">
            {/* HEPSİ Butonu */}
            <button
              onClick={() => setSelectedCategory('HEPSİ')}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 ${
                selectedCategory === 'HEPSİ'
                  ? 'bg-[#5e0d0f] text-white shadow-[#5e0d0f]/20'
                  : 'bg-white text-[#3C2F2F] border border-[#D4A373]/20 hover:border-[#5e0d0f] hover:text-[#5e0d0f]'
              }`}
            >
              🌿 HEPSİ
            </button>

            {/* Dinamik Kategoriler */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-3 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 ${
                  selectedCategory === cat
                    ? 'bg-[#5e0d0f] text-white shadow-[#5e0d0f]/20'
                    : 'bg-white text-[#3C2F2F] border border-[#D4A373]/20 hover:border-[#5e0d0f] hover:text-[#5e0d0f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ================= ÜRÜN IZGARASI ================= */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4A373]/10 shadow-sm">
            <div className="text-5xl mb-4">🛒</div>
            <h3 className="text-lg font-bold text-[#3C2F2F]">Bu kategoride henüz ürün bulunmuyor.</h3>
            <p className="text-sm text-gray-400 mt-1">Daha sonra tekrar kontrol edebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                onClick={() => isAdmin && openModal(product)}
                className={`group bg-white rounded-3xl overflow-hidden shadow-sm border border-[#D4A373]/10 flex flex-col justify-between transition-all duration-300 ${isAdmin ? 'cursor-pointer hover:border-[#D4A373] hover:shadow-xl hover:-translate-y-1' : 'hover:shadow-xl hover:-translate-y-1'}`}
              >
                {/* Görsel Alanı */}
                <div className="p-4 bg-[#FBF9F4] flex items-center justify-center h-48 md:h-56 relative overflow-hidden">
                  
                  {isAdmin && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#5e0d0f] text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1 z-10">
                      <span>✎</span> Düzenle
                    </div>
                  )}
                  
                  <div className="w-full h-full flex items-center justify-center rounded-xl relative z-0">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                          const parent = (e.target as HTMLElement).parentElement;
                          if(parent) parent.innerHTML = '<div class="text-6xl drop-shadow-md"></div>';
                        }}
                      />
                    ) : (
                      <div className="text-6xl drop-shadow-md"></div>
                    )}
                  </div>
                </div>

                {/* Detay Alanı */}
                <div className="p-5 md:p-6 text-center flex flex-col flex-grow">
                  <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest">{product.category}</span>
                  <h3 className="text-base md:text-lg font-bold text-[#3C2F2F] mt-1 mb-3 line-clamp-1 flex-grow">{product.name}</h3>
                  
                  <div className="mt-auto">
                    <div className="text-xl md:text-2xl font-extrabold text-[#5e0d0f] mb-4">
                      {product.price} <span className="text-xs text-gray-400 font-medium tracking-wide">₺ / {product.unit || 'kg'}</span>
                    </div>
<button 
  className="w-full bg-[#5e0d0f] text-white text-sm font-bold py-3 rounded-2xl hover:bg-[#D4A373] transition-all duration-300 shadow-md active:scale-95" 
  onClick={(e) => { 
    if (isAdmin) {
      e.stopPropagation(); // Admin düzenleme paneline tıklamayı engelle
    } else {
      e.preventDefault();
    }
    
    // İŞTE TYPESCRIPT'İN KIZDIĞI YER BURASIYDI. 'unit' satırını ekleyerek hatayı bitiriyoruz:
    const itemToSubmit = {
      id: Number(product.id),
      name: String(product.name),
      price: Number(product.price),
      image_url: String(product.image_url || ''),
      category: String(product.category || 'PEYNİR'),
      unit: String(product.unit || 'kg') // <-- EKSİK OLAN VE HATAYI ÇÖZEN SATIR BU!
    };

    // 'as any' ile göndererek TypeScript'in olası tüm uyumsuzluklarını kesin susturuyoruz
    addToCart(itemToSubmit as any);
  }}
>
  Sepete Ekle
</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= ADMİN MODAL (EKLE / DÜZENLE) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3C2F2F]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-extrabold text-[#5e0d0f]">
                  {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Yönetim Paneli</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-black transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-2 gap-4">
                {/* ÜRÜN ADI */}
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Ürün Adı</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none"
                    placeholder="Örn: Klasik Ezine Peyniri"
                  />
                </div>

                {/* KATEGORİ */}
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Kategori</label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="flex-1 bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none appearance-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    
                    <button type="button" onClick={handleAddCategory} className="w-12 bg-green-50 text-green-600 rounded-2xl border border-green-200 hover:bg-green-600 hover:text-white transition-colors font-bold text-lg flex items-center justify-center shadow-sm" title="Yeni Kategori Ekle">
                      +
                    </button>
                    <button type="button" onClick={handleDeleteCategory} className="w-12 bg-red-50 text-red-600 rounded-2xl border border-red-200 hover:bg-red-600 hover:text-white transition-colors font-bold text-lg flex items-center justify-center shadow-sm" title="Seçili Kategoriyi Sil">
                      -
                    </button>
                  </div>
                </div>

                {/* FİYAT */}
                <div>
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Fiyat (₺)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none"
                    placeholder="Örn: 250"
                  />
                </div>

                {/* BİRİM */}
                <div>
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-1">Birim Seçimi</label>
                  <select 
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none appearance-none"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="Litre">Litre (L)</option>
                    <option value="Adet">Adet</option>
                    <option value="Paket">Paket</option>
                    <option value="Gram">Gram (g)</option>
                  </select>
                </div>
              </div>

              {/* GÖRSEL YÜKLEME */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-3">Görsel Yükle veya Link Gir</label>
                
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4A373]/20 file:text-[#5e0d0f] hover:file:bg-[#D4A373]/30 transition-all mb-3 cursor-pointer"
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 text-gray-400 text-[10px] uppercase font-bold">Veya URL Girin</span></div>
                </div>

                <input 
                  type="text" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full mt-3 bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#D4A373] outline-none transition-all"
                  placeholder="https://... veya /resim.jpg"
                />
              </div>

              {/* AKSİYON BUTONLARI */}
              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="submit"
                  className="w-full bg-[#5e0d0f] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#D4A373] transition-all active:scale-95"
                >
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
                </button>

                {editingProduct && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id)}
                    className="w-full border-2 border-red-100 text-red-600 px-8 py-3.5 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Ürünü Sistemden Sil
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