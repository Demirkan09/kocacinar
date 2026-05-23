'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components//Navbar';
import WhatsAppButton from '@/app/components/WhatsappButton';
export default async function ProfilePage() {
    console.log("Profil sayfası render ediliyor..."); // Terminalde bunu görüyor musun?
  const [activeTab, setActiveTab] = useState('kisisel');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const router = useRouter();

  useEffect(() => {
    const getProfileData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          // Eğer 404 veya başka bir hata dönüyorsa direkt login'e at, sonsuz loading'de kalmasın
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
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

const handleLogout = async () => {
  try {
    const res = await fetch('/api/auth/logout', { 
      method: 'POST' 
    });
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5e0d0f] mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium text-sm">Profil Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SOL MENÜ (SIDEBAR) */}
      <div className="w-80 bg-white border-r border-gray-200 p-8 flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
            {/* İSTEDİĞİN ÇIKIŞ YAP BUTONU */}
            <button 
              onClick={handleLogout} 
              className="text-red-600 text-xs font-semibold flex items-center gap-1 mt-2 hover:underline transition-all"
            >
              ✕ Çıkış Yap
            </button>
          </div>

          <nav className="space-y-6">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hesap Yönetimi</span>
              <div className="mt-3 space-y-2">
                <button onClick={() => setActiveTab('kisisel')} className={`w-full text-left text-sm py-1 transition ${activeTab === 'kisisel' ? 'text-[#5e0d0f] font-bold border-l-2 border-[#5e0d0f] pl-2' : 'text-gray-500 hover:text-black'}`}>Kişisel Bilgilerim</button>
                <button onClick={() => setActiveTab('adres')} className={`w-full text-left text-sm py-1 transition ${activeTab === 'adres' ? 'text-[#5e0d0f] font-bold border-l-2 border-[#5e0d0f] pl-2' : 'text-gray-500 hover:text-black'}`}>Adreslerim</button>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alışveriş</span>
              <div className="mt-3 space-y-2">
                <button onClick={() => setActiveTab('siparis')} className={`w-full text-left text-sm py-1 transition ${activeTab === 'siparis' ? 'text-[#5e0d0f] font-bold border-l-2 border-[#5e0d0f] pl-2' : 'text-gray-500 hover:text-black'}`}>Siparişlerim</button>
                <button onClick={() => setActiveTab('favori')} className={`w-full text-left text-sm py-1 transition ${activeTab === 'favori' ? 'text-[#5e0d0f] font-bold border-l-2 border-[#5e0d0f] pl-2' : 'text-gray-500 hover:text-black'}`}>Beğendiklerim</button>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* SAĞ İÇERİK PANELİ */}
      <div className="flex-1 p-16 bg-white">
        {activeTab === 'kisisel' && (
          <div className="max-w-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Ad</label>
                <input type="text" defaultValue={user.firstName} className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#5e0d0f] text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Soyad</label>
                <input type="text" defaultValue={user.lastName} className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#5e0d0f] text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">E-Posta</label>
                <input type="email" readOnly value={user.email} className="w-full border-b border-gray-200 py-2 text-gray-400 text-sm outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Telefon Numarası</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 (5xx) xxx xx xx" className="w-full border-b border-gray-200 py-2 outline-none focus:border-[#5e0d0f] text-sm" />
              </div>
            </div>
            <button className="mt-10 bg-[#5e0d0f] hover:bg-[#4a0a0b] text-white px-8 py-3 font-semibold text-sm rounded shadow transition-all">
              Değişiklikleri Kaydet
            </button>
          </div>
        )}

        {activeTab === 'adres' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Adreslerim</h3>
            <div className="bg-amber-50 text-amber-800 p-4 rounded text-sm max-w-xl border border-amber-200">
              Henüz kayıtlı bir teslimat adresiniz bulunmuyor.
            </div>
          </div>
        )}

        {activeTab === 'siparis' && <p className="text-gray-500 text-sm">Henüz bir siparişiniz bulunmuyor.</p>}
        {activeTab === 'favori' && <p className="text-gray-500 text-sm">Beğendiğiniz ürünler burada listelenecektir.</p>}
      </div>
    </div>
  );
}