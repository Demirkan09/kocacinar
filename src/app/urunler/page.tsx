'use client';
import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // TypeScript hatasını çözmek için category alanını buraya ekledik kanka
  const [formData, setFormData] = useState({ name: '', price: '', image_url: '', category: 'PEYNİR' });

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

  // 3. KAYDET / GÜNCELLEME FONKSİYONU (FormData Destekli)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('image_url', formData.image_url);
    formDataToSend.append('category', formData.category || 'PEYNİR');
    
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
        alert(editingProduct ? "Ürün güncellendi!" : "Ürün başarıyla eklendi!");
        
        if (editingProduct) {
          setProducts(products.map(p => p.id === editingProduct.id ? data.product : p));
        } else {
          setProducts([data.product, ...products]);
        }
        
        setIsModalOpen(false);
        setSelectedFile(null);
        setFormData({ name: '', price: '', image_url: '', category: 'PEYNİR' });
      } else {
        alert(data.error || "İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
      alert("Sistemsel bir hata oluştu.");
    }
  };

  // 4. Ürün Ekleme veya Düzenleme Penceresinin Açılması
  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ 
        name: product.name, 
        price: product.price.toString(), 
        image_url: product.image_url,
        category: product.category || 'PEYNİR'
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', image_url: '/about.jpg', category: 'PEYNİR' });
    }
    setSelectedFile(null); // Pencere her açıldığında seçilen eski dosyayı sıfırla
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] py-12 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#5e0d0f] mb-2">Ürünlerimiz</h1>
          <p className="text-gray-600">Özenle Seçilmiş Doğal Lezzetler</p>
          
          {isAdmin && (
            <button 
              onClick={() => openModal(null)}
              className="mt-6 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-2.5 rounded-lg shadow-md transition-all text-sm"
            >
              ✚ Yeni Ürün Ekle
            </button>
          )}
        </div>

        {/* Ürün Listeleme Alanı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => isAdmin && openModal(product)}
              className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between transition-all ${isAdmin ? 'cursor-pointer hover:border-orange-500 hover:scale-[1.02] ring-2 ring-orange-500/20' : ''}`}
            >
              <div className="p-6 bg-gray-50 flex items-center justify-center h-48 relative">
                {isAdmin && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                    Düzenlemek İçin Tıklayınız
                  </span>
                )}
                {/* Yüklenen resmi ekranda göstermek için image_url alanını bağlıyoruz */}
                <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        // Eğer resim yüklenemezse fallback olarak emoji göster
                        (e.target as HTMLElement).style.display = 'none';
                        const parent = (e.target as HTMLElement).parentElement;
                        if(parent) parent.innerHTML = '<div class="text-6xl">🧀</div>';
                      }}
                    />
                  ) : (
                    <div className="text-6xl">🧀</div>
                  )}
                </div>
              </div>
              <div className="p-5 border-t border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
                <h3 className="text-base font-bold text-gray-800 mt-1">{product.name}</h3>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-extrabold text-[#5e0d0f]">
                    {product.price} <span className="text-xs text-gray-500 font-normal">₺ / kg</span>
                  </span>
                  <button 
                    className="bg-[#5e0d0f] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#4a0a0b] transition" 
                    onClick={(e) => { if(isAdmin) e.stopPropagation(); }}
                  >
                    Sipariş Ver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dinamik Yönetim Penceresi (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-6 border-b pb-3">
              <h3 className="text-lg font-bold text-[#5e0d0f]">
                {editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-xl">✕</button>
            </div>

            {/* Form etiketini handleSubmit fonksiyonuna bağladık */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Ürün Adı</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#5e0d0f]"
                  placeholder="Örn: Eski Kaşar"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Kategori</label>
                <input 
                  type="text" 
                  required
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#5e0d0f]"
                  placeholder="Örn: PEYNİR, ZEYTİN, ŞARKÜTERİ"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Fiyat (₺ / kg)</label>
                <input 
                  type="number" 
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-[#5e0d0f]"
                  placeholder="Örn: 250"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Ürün Görseli Seçin Veya URL Yazın</label>
                
                {/* Bilgisayardan Dosya Seçme Girişi */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 mb-2 focus:border-[#5e0d0f]"
                />
                
                {/* Manuel URL Girişi */}
                <input 
                  type="text" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm text-gray-600 outline-none focus:border-[#5e0d0f]"
                  placeholder="/about.jpg veya internet linki"
                />
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <button 
                  type="submit"
                  className="w-full bg-[#5e0d0f] hover:bg-[#4a0a0b] text-white font-semibold p-2.5 rounded-lg text-sm transition shadow-md"
                >
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet'}
                </button>

                {/* Düzenleme modundaysak beliren Kırmızı Sil Butonu */}
                {editingProduct && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteProduct(editingProduct.id)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold p-2.5 rounded-lg text-sm transition shadow-md"
                  >
                    🗑️ Bu Ürünü Sistemden Sil
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold p-2 rounded-lg text-sm transition"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}