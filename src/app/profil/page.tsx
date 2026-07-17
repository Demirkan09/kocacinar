'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Switch } from '@/app/components/ui/cnippet-switch';

function ProfileContent() {
  const [activeTab, setActiveTab] = useState('kisisel');
  const [user, setUser] = useState<any>(null);
  const isAdmin = user?.role === 'admin';
  const [loading, setLoading] = useState(true);
  
  // Form State Yapıları (Kişisel)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Premium Bildirim Baloncuğu Stateleri
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Adres Yönetimi State Yapıları
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]); 
  
  // Yeni Adres Formu State'leri
  const [addrTitle, setAddrTitle] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrDetail, setAddrDetail] = useState('');

  // 📦 Sipariş Yönetimi State'leri
  const [myOrders, setMyOrders] = useState<any[]>([]); 
  const [adminOrders, setAdminOrders] = useState<any[]>([]); 
  const [orderSearchQuery, setOrderSearchQuery] = useState(''); 
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Site Ayarları State'leri
  const [minOrderSetting, setMinOrderSetting] = useState('150');
  const [shippingFeeSetting, setShippingFeeSetting] = useState('75');
  const [freeShippingSetting, setFreeShippingSetting] = useState('2000');
  
  // Duyurular State'leri
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Geçmiş Sipariş Detay State'i
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Yönetici Ürün Listesi State'leri
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  const loadSiteSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setMinOrderSetting(data.min_order_amount || '150');
        setShippingFeeSetting(data.shipping_fee || '75');
        setFreeShippingSetting(data.free_shipping_threshold || '2000');
      }
      
      const annRes = await fetch('/api/announcements');
      if (annRes.ok) {
        const annData = await annRes.json();
        setAnnouncementsList(annData);
      }
    } catch (err) {
      console.error('Ayarlar yüklenemedi:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min_order_amount: minOrderSetting,
          shipping_fee: shippingFeeSetting,
          free_shipping_threshold: freeShippingSetting
        })
      });
      if (res.ok) {
        setToastMessage('Site ayarları başarıyla güncellendi ✅');
        setShowToast(true);
      } else {
        setToastMessage('Ayarlar güncellenemedi ❌');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncementText.trim()) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newAnnouncementText })
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncementsList(prev => [...prev, data.announcement]);
        setNewAnnouncementText('');
        setToastMessage('Yeni duyuru başarıyla eklendi ✅');
        setShowToast(true);
      } else {
        setToastMessage(data.error || 'Duyuru eklenemedi ❌');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  const handleUpdateAnnouncement = async (id: number, text: string) => {
    if (!text.trim()) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text })
      });
      const data = await res.json();
      if (data.success) {
        setAnnouncementsList(prev => prev.map(item => item.id === id ? data.announcement : item));
        setToastMessage('Duyuru başarıyla güncellendi ✅');
        setShowToast(true);
      } else {
        setToastMessage(data.error || 'Güncelleme başarısız ❌');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setAnnouncementsList(prev => prev.filter(item => item.id !== id));
        setToastMessage('Duyuru başarıyla silindi ✅');
        setShowToast(true);
      } else {
        setToastMessage('Duyuru silinemedi ❌');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  // URL'den gelen e-posta doğrulama parametresini yakalama
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setToastMessage('E-posta adresiniz başarıyla doğrulandı! ✅');
      setShowToast(true);
    }
  }, [searchParams]);

  // Siparişleri Veritabanından Çekme
const loadOrders = async (isAdmin: boolean) => {
    setIsOrdersLoading(true); // Yükleniyor animasyonunu başlat
    try {
      if (isAdmin) {
        // Adminse her iki isteği de aynı anda atarak süreyi yarıya indir
        const [adminRes, meRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/orders/me')
        ]);
        
        if (adminRes.ok) setAdminOrders(await adminRes.json());
        if (meRes.ok) setMyOrders(await meRes.json());
      } else {
        const resMe = await fetch('/api/orders/me');
        if (resMe.ok) setMyOrders(await resMe.json());
      }
    } catch (e) { 
      console.error('Siparişler çekilemedi', e); 
    } finally {
      setIsOrdersLoading(false); // İstekler bitince animasyonu durdur
    }
  };

  // Ürünlerin listesini çekme ve aktif/pasif durumunu güncelleme (Yönetici)
  const loadAdminProducts = async () => {
    setIsProductsLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProductsList(data);
      }
    } catch (err) {
      console.error('Ürünler yüklenemedi:', err);
    } finally {
      setIsProductsLoading(false);
    }
  };

  const handleToggleProductActive = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_active',
          id: id,
          is_active: !currentStatus
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProductsList(prev => prev.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
          setToastMessage(currentStatus ? 'Ürün satışa kapatıldı 🔴' : 'Ürün satışa açıldı 🟢');
          setShowToast(true);
        } else {
          setToastMessage(data.error || 'İşlem başarısız ❌');
          setShowToast(true);
        }
      }
    } catch (err) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'urunler' && isAdmin) {
      loadAdminProducts();
    }
  }, [activeTab, isAdmin]);

  // Kullanıcı verisini çekme
  useEffect(() => {
    const getProfileData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          
          setFirstName(data.user.first_name || data.user.firstname || data.user.firstName || '');
          setLastName(data.user.last_name || data.user.lastname || data.user.lastName || '');
          setPhone(data.user.phone || ''); 

          if (data.user.address) {
            try {
              const parsedAddresses = typeof data.user.address === 'string' ? JSON.parse(data.user.address) : data.user.address;
              setAddresses(Array.isArray(parsedAddresses) ? parsedAddresses : []);
            } catch (error) {
              console.error("Adres verisi dönüştürülemedi:", error);
            }
          }

          if (data.user.role === 'admin') {
            loadOrders(true);
            loadSiteSettings();
          } else {
            loadOrders(false);
          }

        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    getProfileData();
  }, [router]);

  // Kişisel Bilgileri Güncelleme
  const handleSaveProfile = async () => {
    if (phone) {
      const phoneRegex = /^5\d{9}$/;
      if (!phoneRegex.test(phone)) {
        setToastMessage('Lütfen geçerli bir telefon numarası giriniz (5XXXXXXXXX) ⚠️');
        setShowToast(true);
        return;
      }
    }
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, phone, address: JSON.stringify(addresses) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setToastMessage('Bilgileriniz başarıyla güncellendi ✅');
        setShowToast(true);
        
        setUser((prev: any) => ({ 
          ...prev, 
          first_name: firstName,
          firstname: firstName,
          firstName: firstName,
          last_name: lastName,
          lastname: lastName,
          lastName: lastName,
          phone: phone 
        }));
      } else {
        setToastMessage(data.error || 'Güncelleme başarısız oldu ❌');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  // Adres Kaydetme Fonksiyonu
  const handleSaveAddress = async () => {
    if (!addrTitle || !addrCity || !addrDistrict || !addrDetail) {
      setToastMessage('Lütfen tüm adres alanlarını doldurun ⚠️');
      setShowToast(true);
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      title: addrTitle,
      city: addrCity,
      district: addrDistrict,
      detail: addrDetail
    };

    const updatedAddresses = [...addresses, newAddress];

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, phone, address: JSON.stringify(updatedAddresses) }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAddresses(updatedAddresses);
        setIsAddingAddress(false);
        setAddrTitle(''); setAddrCity(''); setAddrDistrict(''); setAddrDetail('');
        
        setToastMessage('Yeni adres başarıyla eklendi ✅');
        setShowToast(true);
      } else {
        setToastMessage('Adres eklenemedi ❌');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Bağlantı hatası oluştu ❌');
      setShowToast(true);
    }
  };

  // Adres Silme Fonksiyonu
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

    const updatedAddresses = addresses.filter(adr => adr.id !== id);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ firstName, lastName, phone, address: JSON.stringify(updatedAddresses) }),
      });

      if (res.ok) {
        setAddresses(updatedAddresses);
        setToastMessage('Adres başarıyla silindi ✅');
        setShowToast(true);
      }
    } catch (error) {
      setToastMessage('Silme işlemi başarısız ❌');
      setShowToast(true);
    }
  };

  // Admin Sipariş Güncelleme
  const handleUpdateOrderStatus = async (id: number, status: string, trackingCode: string = '') => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, tracking_code: trackingCode })
      });
      if (res.ok) {
        setToastMessage('Sipariş güncellendi ✅');
        setShowToast(true);
        loadOrders(true); 
      }
    } catch (err) { alert('Hata oluştu'); }
  };

  // Bildirimi otomatik kapatma
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5e0d0f] mx-auto mb-4"></div>
          <p className="text-[#3C2F2F] font-bold tracking-widest uppercase text-xs">Profil Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentFN = firstName || user.first_name || user.firstname || user.firstName || '';
  const currentLN = lastName || user.last_name || user.lastname || user.lastName || '';
  
  const avatarInitials = `${currentFN ? currentFN.charAt(0).toUpperCase() : ''}${currentLN ? currentLN.charAt(0).toUpperCase() : ''}`;

  // Sipariş Filtreleri ve Durum Ayarları
  const activeOrders = adminOrders.filter(o => o.status !== 'TESLIM_EDILDI' && o.status !== 'IPTAL');
  const pastOrders = adminOrders.filter(o => o.status === 'TESLIM_EDILDI' || o.status === 'IPTAL')
    .filter(o => o.order_no.toLowerCase().includes(orderSearchQuery.toLowerCase()) || 
                 o.buyer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()));

  const statusConfig: any = {
    'HAZIRLANIYOR': { label: 'Ürün Hazırlanıyor', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    'KARGOYA_VERILDI': { label: 'Kargoya Verildi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    'TESLIM_EDILDI': { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700 border-green-200' },
    'IPTAL': { label: 'İptal Edildi', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans relative">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <div className="w-full md:w-80 bg-white md:min-h-screen p-6 md:p-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D4A373]/20">
        <div>
          <div className="mb-8 md:mb-10 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5e0d0f] to-[#8a1c1f] rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-[#5e0d0f]/20">
              {avatarInitials}
            </div>
            <h2 className="text-2xl font-extrabold text-[#3C2F2F] tracking-tight">
              {currentFN} {currentLN}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
            {isAdmin && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-1 rounded font-bold uppercase mt-2">Yönetici</span>}
          </div>

          {/* MOBİL VE DESKTOP UYUMLU NAVIGASYON (YATAY SCROLL) */}
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 gap-3 md:gap-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <button onClick={() => setActiveTab('kisisel')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 border md:border-none ${activeTab === 'kisisel' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
              <span className="text-lg">👤</span> Kişisel Bilgiler
            </button>
            <button onClick={() => setActiveTab('adres')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 border md:border-none ${activeTab === 'adres' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
              <span className="text-lg">📍</span> Adreslerim
            </button>
            
            {/* SİPARİŞ SEKME - KULLANICI */}
            {!isAdmin && (
              <button onClick={() => setActiveTab('siparis')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 border md:border-none ${activeTab === 'siparis' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
                <span className="text-lg">📦</span> Siparişlerim
              </button>
            )}

            {/* SİPARİŞ SEKMELERİ - ADMİN */}
            {isAdmin && (
              <>
                <div className="hidden md:block my-4 border-t border-gray-100 pt-4"></div>
                <button onClick={() => setActiveTab('aktif_siparisler')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border md:border-none ${activeTab === 'aktif_siparisler' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
                  <span className="text-lg">🚀</span> Siparişler (Aktif)
                  {activeOrders.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{activeOrders.length}</span>}
                </button>
                <button onClick={() => setActiveTab('gecmis_siparisler')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border md:border-none ${activeTab === 'gecmis_siparisler' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
                  <span className="text-lg">📚</span> Geçmiş Siparişler
                </button>
                <button onClick={() => setActiveTab('urunler')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border md:border-none ${activeTab === 'urunler' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
                  <span className="text-lg">🧀</span> Ürünler
                </button>
                <button onClick={() => setActiveTab('site_ayarlari')} className={`snap-start flex-shrink-0 whitespace-nowrap md:w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 border md:border-none ${activeTab === 'site_ayarlari' ? 'bg-[#5e0d0f] text-white shadow-md border-[#5e0d0f]' : 'text-gray-600 bg-white md:bg-transparent hover:bg-[#F5F0E6] border-gray-100'}`}>
                  <span className="text-lg">⚙️</span> Site Ayarları
                </button>
              </>
            )}

          </nav>
        </div>

        <button onClick={handleLogout} className="mt-6 md:mt-12 w-full border border-red-200 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2">
          <span>🚪</span> Güvenli Çıkış Yap
        </button>
      </div>

      {/* SAĞ İÇERİK PANELİ */}
      <div className="flex-1 p-4 md:p-12">
        <div className="bg-white rounded-[32px] p-6 md:p-12 shadow-sm border border-white max-w-5xl mx-auto h-full min-h-[600px]">
          
          {/* ================= KİŞİSEL BİLGİLER TABI ================= */}
          {activeTab === 'kisisel' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-2">Kişisel Bilgileriniz</h3>
                <p className="text-gray-500 text-sm">Hesap bilgilerinizi buradan güncelleyebilirsiniz.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">Adınız</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 px-5 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">Soyadınız</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 px-5 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] transition-all outline-none" />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">E-Posta Adresiniz (Değiştirilemez)</label>
                  <input type="email" readOnly value={user.email} className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-5 text-gray-500 font-medium outline-none cursor-not-allowed" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 flex items-center justify-between">
                    <span>Telefon Numarası</span>
                    <span className="text-gray-400 normal-case tracking-normal">(İsteğe Bağlı)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+90</span>
                    <input 
                      type="tel" 
                      value={phone} 
                      maxLength={10}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) {
                          setPhone(val);
                        }
                      }} 
                      placeholder="5XX XXX XX XX" 
                      className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-16 pr-5 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-end">
                <button onClick={handleSaveProfile} className="w-full md:w-auto bg-[#5e0d0f] text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#D4A373] hover:shadow-[#D4A373]/30 transition-all active:scale-95">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* ================= ADRESLERİM TABI ================= */}
          {activeTab === 'adres' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-2">Adreslerim</h3>
                  <p className="text-gray-500 text-sm">Teslimat adreslerinizi yönetin.</p>
                </div>
                {!isAddingAddress && (
                  <button onClick={() => setIsAddingAddress(true)} className="hidden md:flex bg-[#D4A373] text-[#5e0d0f] px-6 py-3 rounded-xl font-bold hover:bg-[#c49363] transition-all items-center gap-2">
                    <span>+</span> Yeni Ekle
                  </button>
                )}
              </div>

              {isAddingAddress ? (
                <div className="bg-[#FBF9F4] p-6 md:p-8 rounded-3xl border border-[#D4A373]/30">
                  <h4 className="font-bold text-lg text-[#3C2F2F] mb-6">Yeni Adres Ekle</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Adres Başlığı (Ev, İş vb.)</label>
                      <input type="text" value={addrTitle} onChange={(e) => setAddrTitle(e.target.value)} placeholder="Örn: Ev Adresim" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">İl</label>
                      <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="Örn: Aydın" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">İlçe</label>
                      <input type="text" value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} placeholder="Örn: Efeler" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Açık Adres</label>
                      <textarea rows={3} value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} placeholder="Mahalle, sokak, bina no..." className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all resize-none"></textarea>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3 justify-end">
                    <button onClick={() => setIsAddingAddress(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
                      İptal
                    </button>
                    <button onClick={handleSaveAddress} className="bg-[#5e0d0f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D4A373] transition-all shadow-md active:scale-95">
                      Adresi Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {addresses.length === 0 ? (
                    <div className="text-center py-16 bg-[#FBF9F4] rounded-3xl border border-dashed border-[#D4A373]/50">
                      <div className="text-5xl mb-4 opacity-50">📍</div>
                      <p className="text-[#3C2F2F] font-bold text-lg mb-2">Henüz adres eklemediniz.</p>
                      <p className="text-gray-500 text-sm mb-6">Siparişlerinizin hızlı teslimatı için bir adres ekleyin.</p>
                      <button onClick={() => setIsAddingAddress(true)} className="bg-[#5e0d0f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D4A373] transition-all shadow-lg active:scale-95">
                        Yeni Adres Ekle
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {addresses.map((adr) => (
                        <div key={adr.id} className="bg-[#FBF9F4] p-5 rounded-2xl border border-[#D4A373]/20 flex justify-between items-start group hover:border-[#D4A373] transition-all">
                          <div>
                            <h5 className="font-bold text-[#5e0d0f] flex items-center gap-2 mb-1">
                              <span className="text-xl">📍</span> {adr.title}
                            </h5>
                            <p className="text-gray-600 text-sm font-bold uppercase tracking-wider">{adr.city} / {adr.district}</p>
                            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{adr.detail}</p>
                          </div>
                          <button onClick={() => handleDeleteAddress(adr.id)} className="text-red-400 hover:text-red-600 p-2 md:opacity-0 group-hover:opacity-100 transition-all text-xl" title="Adresi Sil">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {!isAddingAddress && (
                <button onClick={() => setIsAddingAddress(true)} className="md:hidden mt-6 w-full bg-[#D4A373] text-[#5e0d0f] px-6 py-4 rounded-xl font-bold hover:bg-[#c49363] transition-all flex justify-center items-center gap-2">
                  <span>+</span> Yeni Adres Ekle
                </button>
              )}
            </div>
          )}

{/* ================= SİPARİŞLERİM TABI (KULLANICI) ================= */}
          {activeTab === 'siparis' && !isAdmin && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-6">Sipariş Geçmişim</h3>
              
              {isOrdersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5e0d0f] mb-4"></div>
                  <p className="text-[#3C2F2F] font-bold tracking-widest uppercase text-xs">Siparişleriniz Yükleniyor...</p>
                </div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="text-6xl mb-6 opacity-30">📦</div>
                  <h4 className="text-2xl font-bold text-[#3C2F2F] mb-2">Siparişiniz Bulunmuyor</h4>
                  <p className="text-gray-500">Lezzetli ürünlerimizden sipariş vererek burayı doldurabilirsiniz.</p>
                  <a href="/urunler" className="inline-block mt-8 bg-[#5e0d0f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D4A373] transition-all">Ürünleri İncele</a>
                </div>
              ) : (
                <div className="space-y-6">
                  {myOrders.map(order => {
                    const status = statusConfig[order.status] || statusConfig['HAZIRLANIYOR'];
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    return (
                      <div key={order.id} className="border border-gray-200 rounded-3xl p-6 shadow-sm hover:border-[#D4A373]/50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-gray-100 pb-4 mb-5 gap-3">
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Sipariş No</p>
                            <p className="font-extrabold text-[#3C2F2F] text-lg">{order.order_no}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('tr-TR')} tarihinde verildi.</p>
                          </div>
                          <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${status.color} flex items-center gap-2 shadow-sm`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse"></span> {status.label}
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-[#FBF9F4] p-3 rounded-xl border border-gray-100">
                              <span className="font-bold text-[#3C2F2F] text-sm">{item.quantity} Adet <span className="text-gray-500 font-medium">x {item.name}</span></span>
                              <span className="font-bold text-[#5e0d0f]">₺{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl flex flex-col md:flex-row justify-between gap-6 text-sm border border-gray-100">
                          <div className="flex-1">
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-[11px] mb-2">Teslimat Adresi</p>
                            <p className="font-medium text-[#3C2F2F] leading-relaxed">{order.shipping_address}</p>
                            {order.tracking_code && (
                              <div className="mt-3 bg-white p-3 border border-blue-100 rounded-xl flex items-center gap-2">
                                <span className="text-lg">🚚</span>
                                <div>
                                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Kargo Takip Kodu</p>
                                  <p className="font-bold text-blue-800">{order.tracking_code}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="text-right md:min-w-[180px] md:border-l border-gray-200 md:pl-6 flex flex-col justify-end pt-4 md:pt-0">
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500 flex justify-between"><span>Ara Toplam:</span> <span>₺{order.subtotal}</span></p>
                              <p className="text-xs text-gray-500 flex justify-between"><span>Kargo:</span> <span>{order.shipping_fee > 0 ? `₺${order.shipping_fee}` : 'Ücretsiz'}</span></p>
                            </div>
                            <div className="border-t border-gray-200 my-2"></div>
                            <p className="text-xl font-extrabold text-[#5e0d0f] flex justify-between items-end">
                              <span className="text-xs text-gray-500 uppercase tracking-widest pb-1 font-bold">Toplam</span> 
                              ₺{order.total_amount}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

{/* ================= AKTİF SİPARİŞLER (ADMİN) ================= */}
          {activeTab === 'aktif_siparisler' && isAdmin && (
            <div className="animate-in fade-in duration-500">
              <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-6 flex items-center gap-3">
                Aktif Siparişler 
                {!isOrdersLoading && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full shadow-sm">{activeOrders.length}</span>
                )}
              </h3>
              
              {isOrdersLoading ? (
                // DÖNEN YÜKLENİYOR GÖRSELİ
                <div className="flex flex-col items-center justify-center py-20 bg-[#FBF9F4] rounded-3xl border border-dashed border-[#D4A373]/30">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5e0d0f] mb-4"></div>
                  <p className="text-[#3C2F2F] font-bold tracking-widest uppercase text-xs">Siparişler Yükleniyor...</p>
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-500 bg-[#FBF9F4] rounded-3xl border border-dashed border-[#D4A373]/30">Bekleyen aktif sipariş yok.</div>
              ) : (
                <div className="space-y-6">
                  {activeOrders.map(order => {
                    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    return (
                      <div key={order.id} className="border-2 border-amber-200 bg-amber-50/30 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        
                        <div className="flex justify-between items-end border-b border-amber-200/50 pb-4 mb-4">
                          <div>
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest mb-1">Sipariş No</p>
                            <h4 className="font-extrabold text-[#3C2F2F] text-lg">{order.order_no}</h4>
                          </div>
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg shadow-sm">
                            {new Date(order.created_at).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                          <div className="bg-white p-4 rounded-2xl border border-amber-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-2">Alıcı Bilgileri</p>
                            <p className="font-bold text-[#3C2F2F] text-base">{order.buyer_name}</p>
                            <p className="text-sm text-gray-500 mb-2">{order.buyer_phone}</p>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-2 rounded-xl">{order.shipping_address}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-inner flex flex-col h-full max-h-48">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-2">Sepet İçeriği</p>
                            <div className="overflow-y-auto flex-1 pr-2 space-y-1">
                              {items.map((i:any, idx:number) => (
                                <div key={idx} className="flex justify-between text-xs font-bold text-[#3C2F2F] py-1 border-b border-gray-50 last:border-0">
                                  <span>{i.quantity}x {i.name}</span>
                                  <span>₺{i.price * i.quantity}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-amber-100 flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500">Kargo: ₺{order.shipping_fee}</span>
                              <span className="font-extrabold text-[#5e0d0f] text-lg">Toplam: ₺{order.total_amount}</span>
                            </div>
                          </div>
                        </div>

                        {/* Yönetim Paneli Alanı */}
                        <div className="flex flex-col md:flex-row gap-4 bg-white p-5 rounded-2xl border border-amber-200 items-end shadow-sm">
                          <div className="flex-1 w-full">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Durum Güncelle</label>
                            <select 
                              className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold text-[#3C2F2F] outline-none focus:border-[#D4A373] transition-colors appearance-none bg-gray-50"
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order.tracking_code)}
                            >
                              <option value="HAZIRLANIYOR">Ürün Hazırlanıyor</option>
                              <option value="KARGOYA_VERILDI">Kargoya Verildi</option>
                              <option value="IPTAL">İptal Et</option>
                            </select>
                          </div>
                          <div className="flex-1 w-full">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Kargo Takip Kodu</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Örn: ArasKargo-12345" 
                                defaultValue={order.tracking_code || ''}
                                id={`track-${order.id}`}
                                className="w-full border-2 border-gray-100 p-3 rounded-xl text-sm font-bold text-[#3C2F2F] outline-none focus:border-blue-300 transition-colors bg-gray-50"
                              />
                              <button 
                                onClick={() => {
                                  const val = (document.getElementById(`track-${order.id}`) as HTMLInputElement).value;
                                  handleUpdateOrderStatus(order.id, 'KARGOYA_VERILDI', val);
                                }}
                                className="bg-blue-600 text-white px-5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                              >Kaydet</button>
                            </div>
                          </div>
                          <div className="w-full md:w-auto mt-2 md:mt-0">
                            <button 
                              onClick={() => {
                                if(confirm("Siparişi teslim edildi olarak işaretlemek istiyor musunuz? Sipariş geçmiş sekmesine taşınacaktır.")) {
                                  handleUpdateOrderStatus(order.id, 'TESLIM_EDILDI', order.tracking_code);
                                }
                              }}
                              className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 shadow-md whitespace-nowrap transition-transform active:scale-95"
                            >
                              ✓ Teslim Edildi
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

{/* ================= GEÇMİŞ SİPARİŞLER (ADMİN) ================= */}
          {activeTab === 'gecmis_siparisler' && isAdmin && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#FBF9F4] p-4 rounded-2xl border border-[#D4A373]/20">
                <h3 className="text-2xl font-extrabold text-[#5e0d0f]">Geçmiş Sipariş Arşivi</h3>
                <div className="relative w-full md:w-72">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Sipariş No veya Alıcı Ara..." 
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-[#3C2F2F] focus:ring-2 focus:ring-[#D4A373] outline-none shadow-sm"
                  />
                </div>
              </div>

              {isOrdersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#FBF9F4] rounded-3xl border border-dashed border-[#D4A373]/30">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#5e0d0f] mb-4"></div>
                  <p className="text-[#3C2F2F] font-bold tracking-widest uppercase text-xs">Arşiv Yükleniyor...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Sipariş No</th>
                        <th className="px-6 py-4">Alıcı İsmi</th>
                        <th className="px-6 py-4">İşlem Tarihi</th>
                        <th className="px-6 py-4">Toplam Tutar</th>
                        <th className="px-6 py-4 text-right">Son Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pastOrders.length > 0 ? pastOrders.map(order => (
                        <tr key={order.id} className="hover:bg-[#FBF9F4] transition-colors">
                          <td 
                            className="px-6 py-4 font-bold text-[#5e0d0f] whitespace-nowrap cursor-pointer hover:underline"
                            onClick={() => setSelectedOrderDetails(order)}
                          >
                            {order.order_no}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#3C2F2F] whitespace-nowrap">{order.buyer_name}</td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                          <td className="px-6 py-4 font-extrabold text-[#3C2F2F] whitespace-nowrap">₺{order.total_amount}</td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow-sm inline-block ${order.status === 'IPTAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                              {order.status === 'IPTAL' ? 'İPTAL EDİLDİ' : 'TESLİM EDİLDİ'}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500 font-medium">
                            <span className="text-4xl block mb-2 opacity-50">📂</span>
                            Aranan kriterlere uygun kayıt bulunamadı.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= ÜRÜNLER TABI (ADMİN) ================= */}
          {activeTab === 'urunler' && isAdmin && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div>
                <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-2">🧀 Ürün Yönetimi</h3>
                <p className="text-gray-500 text-sm">Ürünlerin satış durumunu buradan güncelleyebilirsiniz. Kapalı olan ürünler /urunler sayfasında görünmez.</p>
              </div>

              {isProductsLoading ? (
                <div className="bg-white p-12 rounded-3xl border border-[#D4A373]/10 shadow-sm text-center">
                  <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#5e0d0f] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#3C2F2F] font-bold">Ürünler Yükleniyor...</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#D4A373]/10 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F5F0E6]/30 text-[#5e0d0f] font-bold text-xs uppercase tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4 w-24 text-center">Satışta</th>
                          <th className="px-6 py-4">Ürün Adı</th>
                          <th className="px-6 py-4">Fiyat</th>
                          <th className="px-6 py-4">Kategori</th>
                          <th className="px-6 py-4">Birim (Unit)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productsList.length > 0 ? (
                          productsList.map((prod) => (
                            <tr key={prod.id} className="hover:bg-[#FBF9F4] transition-colors">
                              <td className="px-6 py-4 text-center">
                                <Switch 
                                  checked={prod.is_active !== false} 
                                  onCheckedChange={() => handleToggleProductActive(prod.id, prod.is_active !== false)} 
                                />
                              </td>
                              <td className="px-6 py-4 font-bold text-[#3C2F2F]">{prod.name}</td>
                              <td className="px-6 py-4 font-extrabold text-[#5e0d0f]">₺{Number(prod.price).toFixed(2)}</td>
                              <td className="px-6 py-4">
                                <span className="bg-[#D4A373]/10 text-[#5e0d0f] text-xs px-2.5 py-1 rounded-lg font-bold">
                                  {prod.category}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-medium">{prod.unit_value} {prod.unit}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="text-center py-12 text-gray-500 font-medium">
                              📂 Kayıtlı ürün bulunamadı.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= SİTE AYARLARI TABI (ADMİN) ================= */}
          {activeTab === 'site_ayarlari' && isAdmin && (
            <div className="animate-in fade-in duration-500 space-y-8">
              <div>
                <h3 className="text-3xl font-extrabold text-[#5e0d0f] mb-2">⚙️ Genel Site Ayarları</h3>
                <p className="text-gray-500 text-sm">Alışveriş limitlerini, kargo ücretlerini ve üst banttaki duyuruları buradan yönetebilirsiniz.</p>
              </div>

              {/* 1. Limitler ve Ücretler Kartı */}
              <div className="bg-[#FBF9F4] p-6 md:p-8 rounded-3xl border border-[#D4A373]/30 shadow-sm space-y-6">
                <h4 className="font-bold text-lg text-[#3C2F2F] border-b border-[#D4A373]/20 pb-3 flex items-center gap-2">
                  <span>💳</span> Sipariş & Kargo Kuralları
                </h4>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block">Minimum Sipariş Tutarı (₺)</label>
                    <input 
                      type="number" 
                      value={minOrderSetting} 
                      onChange={(e) => setMinOrderSetting(e.target.value)} 
                      className="w-full bg-white border border-[#D4A373]/20 rounded-2xl py-3.5 px-4 text-[#3C2F2F] font-bold focus:ring-2 focus:ring-[#5e0d0f] outline-none transition-all shadow-inner" 
                      placeholder="Örn: 150"
                    />
                    <span className="text-[10px] text-gray-400 block px-1">Müşteriler bu tutarın altında sipariş veremez.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block">Kargo Ücreti (₺)</label>
                    <input 
                      type="number" 
                      value={shippingFeeSetting} 
                      onChange={(e) => setShippingFeeSetting(e.target.value)} 
                      className="w-full bg-white border border-[#D4A373]/20 rounded-2xl py-3.5 px-4 text-[#3C2F2F] font-bold focus:ring-2 focus:ring-[#5e0d0f] outline-none transition-all shadow-inner" 
                      placeholder="Örn: 75"
                    />
                    <span className="text-[10px] text-gray-400 block px-1">Eşik değerinin altında kargo ücreti olarak yansıtılır.</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block">Ücretsiz Kargo Sınırı (₺)</label>
                    <input 
                      type="number" 
                      value={freeShippingSetting} 
                      onChange={(e) => setFreeShippingSetting(e.target.value)} 
                      className="w-full bg-white border border-[#D4A373]/20 rounded-2xl py-3.5 px-4 text-[#3C2F2F] font-bold focus:ring-2 focus:ring-[#5e0d0f] outline-none transition-all shadow-inner" 
                      placeholder="Örn: 2000"
                    />
                    <span className="text-[10px] text-gray-400 block px-1">Bu tutar ve üzeri alışverişlerde kargo ücretsiz olur.</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSaveSettings} 
                    className="bg-[#5e0d0f] hover:bg-[#D4A373] text-white px-8 py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all text-sm flex items-center gap-2"
                  >
                    Ayarları Kaydet ✓
                  </button>
                </div>
              </div>

              {/* 2. Announcement / Duyuru Yönetimi Kartı */}
              <div className="bg-[#FBF9F4] p-6 md:p-8 rounded-3xl border border-[#D4A373]/30 shadow-sm space-y-6">
                <h4 className="font-bold text-lg text-[#3C2F2F] border-b border-[#D4A373]/20 pb-3 flex items-center gap-2">
                  <span>📢</span> Üst Kayan Duyuru Metinleri
                </h4>

                {/* Kayan Duyuruları Listele */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                  {announcementsList.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-4 font-medium">Henüz kayıtlı bir duyuru bulunmuyor. Eklemek için aşağıdaki alanı kullanın.</p>
                  ) : (
                    announcementsList.map((ann, idx) => (
                      <div key={ann.id} className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm group">
                        <span className="text-xs text-gray-400 font-bold w-6 text-center">#{idx + 1}</span>
                        <input 
                          type="text" 
                          defaultValue={ann.text} 
                          id={`ann-text-${ann.id}`}
                          className="flex-1 bg-transparent border-0 text-sm font-bold text-[#3C2F2F] outline-none focus:ring-1 focus:ring-[#D4A373] rounded-xl px-2 py-1 transition-all"
                        />
                        <button 
                          onClick={() => {
                            const val = (document.getElementById(`ann-text-${ann.id}`) as HTMLInputElement).value;
                            handleUpdateAnnouncement(ann.id, val);
                          }}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                        >
                          Kaydet
                        </button>
                        <button 
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Yeni Duyuru Ekleme Bölümü */}
                <div className="pt-4 border-t border-[#D4A373]/10">
                  <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1 block mb-2">Yeni Duyuru Metni Ekle</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newAnnouncementText} 
                      onChange={(e) => setNewAnnouncementText(e.target.value)} 
                      placeholder="Örn: 2000 TL ve Üzeri Alışverişlerde Ücretsiz Kargo"
                      className="flex-1 bg-white border border-[#D4A373]/20 rounded-2xl py-3.5 px-4 text-[#3C2F2F] text-sm focus:ring-2 focus:ring-[#5e0d0f] outline-none transition-all shadow-inner font-medium"
                    />
                    <button 
                      onClick={handleAddAnnouncement}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-2xl text-sm transition-all active:scale-95 shadow-sm flex items-center gap-1 whitespace-nowrap"
                    >
                      <span className="text-base">+</span> Ekle
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ================= GEÇMİŞ SİPARİŞ DETAY MODALI ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-[#3C2F2F]/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[32px] max-w-2xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Sipariş Detayı</p>
                <h3 className="text-2xl font-extrabold text-[#5e0d0f]">{selectedOrderDetails.order_no}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderDetails(null)} 
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Alıcı ve İletişim Bilgileri */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Müşteri Bilgileri</p>
                  <p className="font-bold text-[#3C2F2F] text-sm">{selectedOrderDetails.buyer_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedOrderDetails.buyer_phone}</p>
                </div>
                <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Sipariş Durumu</p>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide inline-block ${
                    selectedOrderDetails.status === 'IPTAL' 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : selectedOrderDetails.status === 'TESLIM_EDILDI'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {statusConfig[selectedOrderDetails.status]?.label || selectedOrderDetails.status}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1.5">{new Date(selectedOrderDetails.created_at).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              {/* Teslimat Adresi ve Kargo Takip */}
              <div className="bg-[#FBF9F4] p-5 rounded-2xl border border-gray-100 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Teslimat Adresi</p>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{selectedOrderDetails.shipping_address}</p>
                </div>
                {selectedOrderDetails.tracking_code && (
                  <div className="pt-2 border-t border-gray-200/50 flex items-center gap-2">
                    <span className="text-lg">🚚</span>
                    <div>
                      <p className="text-[9px] text-blue-600 font-bold uppercase tracking-widest">Kargo Takip Kodu</p>
                      <p className="font-bold text-blue-800 text-xs">{selectedOrderDetails.tracking_code}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sepet İçeriği */}
              <div className="bg-[#FBF9F4] p-5 rounded-2xl border border-gray-100 shadow-inner">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b pb-1">Sepet Detayı</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                  {(typeof selectedOrderDetails.items === 'string' ? JSON.parse(selectedOrderDetails.items) : selectedOrderDetails.items).map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-[#3C2F2F] py-1 border-b border-gray-50 last:border-0">
                      <span>{i.quantity}x {i.name}</span>
                      <span>₺{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Ara Toplam:</span>
                    <span>₺{selectedOrderDetails.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Kargo Ücreti:</span>
                    <span>{Number(selectedOrderDetails.shipping_fee) > 0 ? `₺${selectedOrderDetails.shipping_fee}` : 'Ücretsiz'}</span>
                  </div>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="flex justify-between font-extrabold text-[#5e0d0f] text-sm">
                    <span>Genel Toplam:</span>
                    <span>₺{selectedOrderDetails.total_amount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SAĞ ALT PREMIUM BİLDİRİM BALONCUĞU (TOAST) ================= */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3C2F2F] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#D4A373]/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <p className="text-sm font-bold tracking-wide">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5e0d0f] mx-auto mb-4"></div>
          <p className="text-[#3C2F2F] font-bold tracking-widest uppercase text-xs">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}