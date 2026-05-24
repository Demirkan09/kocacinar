'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('kisisel');
  const [user, setUser] = useState<any>(null);
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

  const router = useRouter();

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

          // ✅ Veritabanından gelen adresi JSON olarak ayrıştır ve listeye koy
          if (data.user.address) {
            try {
              const parsedAddresses = typeof data.user.address === 'string' ? JSON.parse(data.user.address) : data.user.address;
              setAddresses(Array.isArray(parsedAddresses) ? parsedAddresses : []);
            } catch (error) {
              console.error("Adres verisi dönüştürülemedi:", error);
            }
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
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        // Adres verisinin ezilmemesi için adresleri de gönderiyoruz
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

  // ✅ YENİ: Adres Kaydetme Fonksiyonu
  const handleSaveAddress = async () => {
    if (!addrTitle || !addrCity || !addrDistrict || !addrDetail) {
      setToastMessage('Lütfen tüm adres alanlarını doldurun ⚠️');
      setShowToast(true);
      return;
    }

    const newAddress = {
      id: Date.now().toString(), // Adresleri silerken ayırt etmek için benzersiz ID
      title: addrTitle,
      city: addrCity,
      district: addrDistrict,
      detail: addrDetail
    };

    const updatedAddresses = [...addresses, newAddress];

    try {
      // API'ye adresi güncellenmiş JSON listesi olarak postalıyoruz
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
        // Formu temizle
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

  // ✅ YENİ: Adres Silme Fonksiyonu
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
        router.push('/login');
        router.refresh();
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

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex flex-col md:flex-row font-sans relative">
      
      {/* SOL MENÜ (SIDEBAR) */}
      <div className="w-full md:w-80 bg-white md:min-h-screen p-6 md:p-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#D4A373]/20">
        <div>
          <div className="mb-10 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5e0d0f] to-[#8a1c1f] rounded-3xl flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-[#5e0d0f]/20">
              {avatarInitials}
            </div>
            <h2 className="text-2xl font-extrabold text-[#3C2F2F] tracking-tight">
              {currentFN} {currentLN}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{user.email}</p>
          </div>

          <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar gap-2 md:gap-0">
            <button onClick={() => setActiveTab('kisisel')} className={`flex-shrink-0 w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === 'kisisel' ? 'bg-[#5e0d0f] text-white shadow-md' : 'text-gray-600 hover:bg-[#F5F0E6]'}`}>
              <span className="text-lg">👤</span> Kişisel Bilgiler
            </button>
            <button onClick={() => setActiveTab('adres')} className={`flex-shrink-0 w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === 'adres' ? 'bg-[#5e0d0f] text-white shadow-md' : 'text-gray-600 hover:bg-[#F5F0E6]'}`}>
              <span className="text-lg">📍</span> Adreslerim
            </button>
            <button onClick={() => setActiveTab('siparis')} className={`flex-shrink-0 w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === 'siparis' ? 'bg-[#5e0d0f] text-white shadow-md' : 'text-gray-600 hover:bg-[#F5F0E6]'}`}>
              <span className="text-lg">📦</span> Siparişlerim
            </button>
            <button onClick={() => setActiveTab('favori')} className={`flex-shrink-0 w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === 'favori' ? 'bg-[#5e0d0f] text-white shadow-md' : 'text-gray-600 hover:bg-[#F5F0E6]'}`}>
              <span className="text-lg">❤️</span> Favorilerim
            </button>
          </nav>
        </div>

        <button onClick={handleLogout} className="mt-8 md:mt-12 w-full border border-red-200 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2">
          <span>🚪</span> Güvenli Çıkış Yap
        </button>
      </div>

      {/* SAĞ İÇERİK PANELİ */}
      <div className="flex-1 p-4 md:p-12">
        <div className="bg-white rounded-[32px] p-6 md:p-12 shadow-sm border border-white max-w-4xl mx-auto h-full min-h-[600px]">
          
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
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(5XX) XXX XX XX" className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-16 pr-5 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] transition-all outline-none" />
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
                // ✅ ADRES EKLEME FORMU
                <div className="bg-[#FBF9F4] p-6 md:p-8 rounded-3xl border border-[#D4A373]/30">
                  <h4 className="font-bold text-lg text-[#3C2F2F] mb-6">Yeni Adres Ekle</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Adres Başlığı (Ev, İş vb.)</label>
                      <input type="text" value={addrTitle} onChange={(e) => setAddrTitle(e.target.value)} placeholder="Örn: Ev Adresim" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">İl</label>
                      <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder="Örn: Aydın" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">İlçe</label>
                      <input type="text" value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} placeholder="Örn: Efeler" className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Açık Adres</label>
                      <textarea rows={3} value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} placeholder="Mahalle, sokak, bina no..." className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#D4A373] outline-none transition-all resize-none"></textarea>
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
                    // ✅ KAYITLI ADRESLER LİSTESİ
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

          {/* ================= SİPARİŞLERİM TABI ================= */}
          {activeTab === 'siparis' && (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <div className="text-6xl mb-6 opacity-30">📦</div>
              <h4 className="text-2xl font-bold text-[#3C2F2F] mb-2">Siparişiniz Bulunmuyor</h4>
              <p className="text-gray-500">Lezzetli ürünlerimizden sipariş vererek burayı doldurabilirsiniz.</p>
              <a href="/urunler" className="inline-block mt-8 bg-[#5e0d0f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#D4A373] transition-all">
                Ürünleri İncele
              </a>
            </div>
          )}

          {/* ================= FAVORİLERİM TABI ================= */}
          {activeTab === 'favori' && (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <div className="text-6xl mb-6 opacity-30">❤️</div>
              <h4 className="text-2xl font-bold text-[#3C2F2F] mb-2">Favori Ürününüz Yok</h4>
              <p className="text-gray-500">Beğendiğiniz ürünleri favorilere ekleyerek hızlıca ulaşabilirsiniz.</p>
            </div>
          )}

        </div>
      </div>

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