'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/app/components/cart';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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

const normalizeTurkish = (str: string | null | undefined) => {
  if (!str) return '';
  return str
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
};

function UrunlerPage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('HEPSİ');
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('q') || '';
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // 🚀 YENİ: Gerçek dosyayı hafızada tutacak State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 🚀 YENİ: Görsel Büyütme (Lightbox) State'i
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // 🚀 YENİ: Toplu Ürün Ekleme Sekme ve Veri State'leri
  const [adminTab, setAdminTab] = useState<'single' | 'bulk'>('single');
  const [bulkItems, setBulkItems] = useState<any[]>([]);
  const [bulkUploadProgress, setBulkUploadProgress] = useState<{ current: number; total: number } | null>(null);

  const [formData, setFormData] = useState({ 
    name: '', price: '', old_price: '', image_url: '', category: '', unit: 'kg' 
  });
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleBulkImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems = filesArray.map((file) => {
        // Otomatik isim tahmini: dosya isminden uzantıyı temizle, çizgi ve alt çizgileri boşluk yap
        const autoName = file.name
          .substring(0, file.name.lastIndexOf('.'))
          .replace(/[-_]/g, ' ')
          .trim();

        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl: URL.createObjectURL(file),
          name: autoName,
          price: '',
          old_price: '',
          category: categories[0] || 'PEYNİR',
          unit: 'kg'
        };
      });

      setBulkItems((prev) => [...prev, ...newItems]);
    }
  };

  const removeBulkItem = (id: string) => {
    setBulkItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkItems.length === 0) {
      alert("Lütfen en az bir görsel seçin.");
      return;
    }

    // Basit validasyon: Tüm ürünleri kontrol et
    for (const item of bulkItems) {
      if (!item.name.trim() || !item.price.trim() || isNaN(parseFloat(item.price))) {
        alert(`Lütfen "${item.name || 'İsimsiz Ürün'}" için geçerli bir ad ve fiyat girin.`);
        return;
      }
    }

    setBulkUploadProgress({ current: 0, total: bulkItems.length });
    const uploadedProducts: Product[] = [];

    try {
      for (let i = 0; i < bulkItems.length; i++) {
        const item = bulkItems[i];
        setBulkUploadProgress({ current: i + 1, total: bulkItems.length });

        const submitData = new FormData();
        submitData.append('name', item.name);
        submitData.append('price', item.price);
        if (item.old_price) submitData.append('old_price', item.old_price);
        submitData.append('category', item.category);
        submitData.append('unit', item.unit);
        submitData.append('image', item.file);

        const res = await fetch('/api/products', {
          method: 'POST',
          body: submitData
        });

        const data = await res.json();
        if (data.success) {
          uploadedProducts.push(data.product);
        } else {
          console.error(`Ürün yükleme hatası (${item.name}):`, data.error);
        }
      }

      // Yeni ürünleri ekle
      setProducts((prev) => [...uploadedProducts, ...prev]);

      // Bellek temizleme
      bulkItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setBulkItems([]);
      setIsModalOpen(false);

      alert(`${uploadedProducts.length} adet ürün başarıyla yüklendi!`);
    } catch (err) {
      console.error("Toplu yükleme hatası:", err);
      alert("Toplu ürünler yüklenirken bir sorun oluştu.");
    } finally {
      setBulkUploadProgress(null);
    }
  };

  // 🚀 GÜNCELLENDİ: Base64 iptal! Gerçek dosyayı alıp sadece önizleme oluşturuyoruz
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) { // Limiti 5MB'a çıkardık rahat olsun
        alert("Yüklemek istediğiniz resim çok büyük! Lütfen 5MB'tan küçük bir görsel seçiniz.");
        return;
      }

      setSelectedFile(file); // Dosyayı backend'e atmak üzere kaydet
      
      // Ekranda anlık göstermek için tarayıcıda geçici bir link oluştur
      setFormData(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
    }
  };

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        setIsLoading(true);

        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) {
            setCategories(catData);
            if (catData.length > 0) setFormData(prev => ({ ...prev, category: catData[0] }));
          }
        }

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
      } else alert(data.error || "Hata oluştu.");
    } catch (err) {}
  };

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
    } catch (err) {}
  };

  const handleDeleteCategory = async (cat: string) => {
    if (categories.length <= 1) return alert("En az bir kategori bulunmalıdır!");
    if (!confirm(`"${cat}" silinsin mi?`)) return;
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
      } else alert(data.error || "Hata.");
    } catch (err) {}
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
    } catch (err) {}
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if ((await res.json()).success) {
        setProducts(products.filter(p => p.id !== id));
        setIsModalOpen(false);
      }
    } catch (err) {}
  };

  // 🚀 GÜNCELLENDİ: Formu JSON değil, Dosya taşıyabilen FormData olarak gönderiyoruz
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    if (formData.old_price) submitData.append('old_price', formData.old_price);
    submitData.append('category', formData.category || categories[0]);
    submitData.append('unit', formData.unit || 'kg');

    // Eğer bilgisayardan yeni bir resim seçildiyse onu pakete koy
    if (selectedFile) {
      submitData.append('image', selectedFile);
    } else {
      // Sadece yazıları güncelliyorsa eski linki koy
      submitData.append('image_url', formData.image_url);
    }

    if (editingProduct) {
      submitData.append('id', editingProduct.id.toString());
    }

    try {
      const res = await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        // DİKKAT: FormData'da Content-Type manuel yazılmaz, tarayıcı dosya boyutuna göre ayarlar!
        body: submitData 
      });
      
      const data = await res.json();
      if (data.success) {
        if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        else setProducts([data.product, ...products]);
        setIsModalOpen(false);
        setFormData({ name: '', price: '', old_price: '', image_url: '', category: categories[0], unit: 'kg' });
        setSelectedFile(null); // Başarılı olunca dosyayı hafızadan sil
      } else {
        alert(`Hata: ${data.error || 'Ürün kaydedilemedi.'}`);
      }
    } catch (err) {
      console.error("Form gönderme hatası:", err);
      alert("Canlı sunucu bağlantısında hata oluştu.");
    }
  };

  const openModal = (product: Product | null = null) => {
    setSelectedFile(null); // Modal açılırken eski seçili dosyayı temizle
    setAdminTab('single'); // Varsayılan olarak tek ürün sekmesini aç
    bulkItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setBulkItems([]);
    setBulkUploadProgress(null);
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
      ? normalizeTurkish(product.name).includes(normalizeTurkish(searchQuery))
      : true;
    return matchesCategory && matchesSearch;
  });
  
  return (
    <div className="min-h-screen bg-[#F5F0E6] py-16 px-4 md:px-8 font-sans relative">
      <div className="max-w-7xl mx-auto">
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

        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D4A373]/10 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#5e0d0f] rounded-full animate-spin"></div>
            <div className="text-lg font-bold text-[#3C2F2F] tracking-wide animate-pulse">
              Ürünler yükleniyor...
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
                  key={product.id} draggable={isAdmin} onDragStart={() => handleDragStart(index)} onDragOver={handleDragOver} onDrop={() => handleDrop(index)}
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
                        onClick={() => setZoomedImage(product.image_url)}
                        className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.04]" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FBF9F4] flex items-center justify-center text-5xl">🧀</div>
                    )}
                  </div>

                  <div className="p-4 md:p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#D4A373] tracking-wider uppercase block">{product.category}</span>
                      <h3 className="font-bold text-[#3C2F2F] text-sm md:text-base break-words group-hover:text-[#5e0d0f] transition-colors">{product.name}</h3>
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
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3C2F2F]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-lg w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-extrabold text-[#5e0d0f]">{editingProduct ? 'Ürünü Düzenle' : 'Yönetim Paneli'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>

            {/* Sekme Seçimi (Sadece Yeni Ürün Eklerken) */}
            {!editingProduct && (
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => setAdminTab('single')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                    adminTab === 'single'
                      ? 'border-[#5e0d0f] text-[#5e0d0f]'
                      : 'border-transparent text-gray-400 hover:text-[#5e0d0f]'
                  }`}
                >
                  Tek Ürün Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('bulk')}
                  className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${
                    adminTab === 'bulk'
                      ? 'border-[#5e0d0f] text-[#5e0d0f]'
                      : 'border-transparent text-gray-400 hover:text-[#5e0d0f]'
                  }`}
                >
                  Toplu Ürün Ekle
                </button>
              </div>
            )}

            {adminTab === 'bulk' && !editingProduct ? (
              <form onSubmit={handleBulkSubmit} className="space-y-6">
                {bulkUploadProgress ? (
                  <div className="flex flex-col items-center justify-center py-12 bg-[#FBF9F4] rounded-3xl border border-[#D4A373]/30">
                    <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#5e0d0f] rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-[#5e0d0f]">Ürünler Yükleniyor...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {bulkUploadProgress.current} / {bulkUploadProgress.total} tamamlandı
                    </p>
                    <div className="w-48 bg-gray-200 h-2 rounded-full mt-4 overflow-hidden">
                      <div 
                        className="bg-[#5e0d0f] h-full transition-all duration-300"
                        style={{ width: `${(bulkUploadProgress.current / bulkUploadProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#F5F0E6] p-5 rounded-2xl border border-[#D4A373]/30 text-xs text-[#5e0d0f] leading-relaxed text-center">
                      <span className="font-bold block text-sm mb-2">📸 Toplu Ürün Görseli Yükleme</span>
                      Cihazınızdan birden fazla ürün görseli seçin.<br />
                      Seçtiğiniz her görsel için ürün detaylarını aşağıda doldurabilirsiniz.
                    </div>

                    {/* Dosya Seçme Tuşu */}
                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-[#D4A373]/40 flex flex-col items-center justify-center hover:bg-[#FBF9F4] transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleBulkImagesChange} 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <span className="text-3xl mb-2">📁</span>
                      <span className="font-bold text-sm text-[#5e0d0f]">Görselleri Seçmek İçin Tıklayın</span>
                      <span className="text-xs text-gray-400 mt-1">Sürükleyip bırakabilir veya çoklu seçim yapabilirsiniz</span>
                    </div>

                    {/* Seçilen Görsellerin Listesi */}
                    {bulkItems.length > 0 && (
                      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 no-scrollbar">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                          <span className="font-bold text-xs text-gray-500">SEÇİLEN GÖRSELLER ({bulkItems.length})</span>
                          <button 
                            type="button" 
                            onClick={() => {
                              bulkItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
                              setBulkItems([]);
                            }} 
                            className="text-xs text-red-500 hover:underline font-bold"
                          >
                            Tümünü Temizle
                          </button>
                        </div>
                        
                        {bulkItems.map((item, idx) => (
                          <div key={item.id} className="p-4 bg-[#FBF9F4] border border-gray-200 rounded-2xl relative space-y-4 shadow-sm">
                            <button
                              type="button"
                              onClick={() => removeBulkItem(item.id)}
                              className="absolute top-3 right-3 bg-red-50 hover:bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors font-bold"
                              title="Bu resmi çıkart"
                            >
                              ✕
                            </button>

                            <div className="flex gap-4">
                              <div className="w-20 h-20 relative rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                                <img src={item.previewUrl} alt="Önizleme" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                <span className="text-[10px] text-gray-400 font-bold block mb-1">GÖRSEL #{idx + 1}</span>
                                <span className="text-xs text-gray-600 truncate max-w-[200px]">{item.file.name}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">{(item.file.size / 1024 / 1024).toFixed(2)} MB</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                              <div className="col-span-2">
                                <label className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider block mb-1">Ürün Adı</label>
                                <input
                                  type="text"
                                  required
                                  value={item.name}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, name: val } : p));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#D4A373] outline-none"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider block mb-1">Kategori</label>
                                <select
                                  value={item.category}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, category: val } : p));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#D4A373] outline-none"
                                >
                                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-[#5e0d0f] uppercase tracking-wider block mb-1">Satış Fiyatı (₺)</label>
                                <input
                                  type="number"
                                  required
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, price: val } : p));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#5e0d0f] outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">İndirimsiz Fiyat (₺)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={item.old_price}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, old_price: val } : p));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-gray-300 outline-none"
                                  placeholder="Opsiyonel"
                                />
                              </div>

                              <div className="col-span-2">
                                <label className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider block mb-1">Birim</label>
                                <select
                                  value={item.unit}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setBulkItems(prev => prev.map(p => p.id === item.id ? { ...p, unit: val } : p));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#D4A373] outline-none"
                                >
                                  <option value="kg">Kilogram (kg)</option>
                                  <option value="Litre">Litre (L)</option>
                                  <option value="Adet">Adet</option>
                                  <option value="Paket">Paket</option>
                                  <option value="Gram">Gram (g)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={bulkItems.length === 0}
                        className="w-full bg-[#5e0d0f] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#D4A373] transition-all disabled:opacity-50 disabled:hover:bg-[#5e0d0f] disabled:cursor-not-allowed"
                      >
                        {bulkItems.length} Adet Ürünü Ekle
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              <>
                <div className="mb-8 p-5 bg-[#FBF9F4] border border-[#D4A373]/30 rounded-2xl">
                  <h4 className="text-sm font-bold text-[#5e0d0f] uppercase tracking-widest mb-3">Kategorileri Yönet</h4>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Yeni Kategori Adı..." className="flex-1 bg-white border border-[#D4A373]/20 rounded-xl px-3 text-sm focus:ring-1 focus:ring-[#D4A373] outline-none text-[#3C2F2F]" />
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

              {/* DOSYA YÜKLEME ALANI GÜNCELLENDİ */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300">
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4A373]/20 file:text-[#5e0d0f] hover:file:bg-[#D4A373]/30 transition-all cursor-pointer mb-3" />
                
                {/* Eğer mevcut resim varsa veya yeni seçildiyse linkini göster */}
                <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-[#3C2F2F] text-xs focus:ring-1 focus:ring-[#D4A373] outline-none" placeholder="Veya İnternetten Resim URL Girin (https://...)" />
                
                {selectedFile && (
                  <button type="button" onClick={() => { setSelectedFile(null); setFormData({...formData, image_url: ''}); }} className="text-[10px] text-red-500 hover:underline mt-1 block pl-1">Seçili Dosyayı İptal Et</button>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button type="submit" className="w-full bg-[#5e0d0f] text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#D4A373] transition-all">
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
                </button>
                {editingProduct && (
                  <button type="button" onClick={() => handleDeleteProduct(editingProduct.id)} className="w-full border-2 border-red-100 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm">Ürünü Sil</button>
                )}
              </div>
            </form>
          </>
        )}
          </div>
        </div>
      )}

      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            onClick={() => setZoomedImage(null)} 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-4xl font-light p-2 transition-colors focus:outline-none z-10"
            aria-label="Kapat"
          >
            ✕
          </button>
          <div 
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center animate-in zoom-in-95 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={zoomedImage} 
              alt="Büyütülmüş ürün görseli" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function UrunlerPageWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center text-[#5e0d0f] font-bold">Yükleniyor...</div>}>
      <UrunlerPage />
    </Suspense>
  );
}