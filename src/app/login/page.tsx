'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRight } from 'react-icons/hi2';

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
        setTimeout(() => {
          router.push('/urunler'); 
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4 md:p-6 font-sans">
      {/* Arka Plan Dekoratif Objeler */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4A373]/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5e0d0f]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-white relative z-10">
        {/* Logo Bölümü */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#5e0d0f] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[#5e0d0f]/20 mx-auto mb-4">
            🌳
          </div>
          <h2 className="text-3xl font-extrabold text-[#3C2F2F] tracking-tight">Tekrar Hoş Geldiniz</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Koca Çınar Şarküteri Lezzet Dünyası</p>
        </div>

        {/* Bildirim Mesajları */}
        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* E-POSTA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] px-1">E-Posta Adresi</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="ornek@mail.com"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-12 pr-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none" 
              />
            </div>
          </div>

          {/* ŞİFRE */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em]">Şifre</label>
              <a href="/sifremi-unuttum" className="text-[11px] font-bold text-gray-400 hover:text-[#5e0d0f] transition uppercase tracking-wider">Şifremi Unuttum</a>
            </div>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="password" 
                required 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••••"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-12 pr-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#5e0d0f]/10 transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Giriş Yap
                <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Kayıt Ol Yönlendirmesi */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm font-medium">
            Henüz hesabınız yok mu?{' '}
            <a href="/register" className="text-[#5e0d0f] font-extrabold hover:text-[#D4A373] transition-colors underline decoration-[#D4A373]/30 underline-offset-4">
              Hemen Kayıt Olun
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}