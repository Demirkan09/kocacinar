// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components//Navbar';
import WhatsAppButton from '@/app/components/WhatsappButton';
export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Giriş yapılamadı.' });
      } else {
        setMessage({ type: 'success', text: 'Giriş başarılı! Yönlendiriliyorsunuz...' });
        
        // Başarılı girişten 1.5 saniye sonra kullanıcıyı ana sayfaya veya profile şutluyoruz
        setTimeout(() => {
          router.push('/profil'); 
          router.refresh(); // Sayfayı yenileyerek navbarın durumunu güncelliyoruz
        }, 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (

    
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-[#D4A373]/20">
        <h2 className="text-3xl font-bold text-[#5e0d0f] text-center mb-2">Giriş Yap</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Koca Çınar Şarküteri</p>

        {message.text && (
          <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">E-Posta Adresi</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Şifre</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" 
            />
          </div>
          <div className="flex justify-end">
            <a href="/sifremi-unuttum" className="text-xs text-gray-500 hover:text-[#5e0d0f] transition hover:underline">
              Şifremi Unuttum
            </a>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#5e0d0f] text-white font-semibold p-3 rounded-lg">
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        {/* İstediğin Alt Link / Kayıt Ol Yönlendirmesi */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Henüz kayıt olmadın mı?{' '}
          <a href="/register" className="text-[#5e0d0f] font-bold hover:underline transition">
            Hemen Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}