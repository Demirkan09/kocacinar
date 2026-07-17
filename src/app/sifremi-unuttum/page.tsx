'use client';

import { useState } from 'react';
import { HiOutlineEnvelope, HiOutlineArrowRight } from 'react-icons/hi2';

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'İşlem başarısız.' });
      } else {
        setMessage({ type: 'success', text: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! 🚀' });
        setEmail('');
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4 md:p-6 font-sans relative">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-white relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#5e0d0f] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[#5e0d0f]/20 mx-auto mb-4">
            🔑
          </div>
          <h2 className="text-3xl font-extrabold text-[#3C2F2F] tracking-tight">Şifremi Unuttum</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">E-posta adresinizi girerek şifrenizi sıfırlayabilirsiniz.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] px-1">E-Posta Adresi</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="email" required value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ornek@mail.com"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-12 pr-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading} 
            className="w-full bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {loading ? 'Gönderiliyor...' : (
              <>
                Sıfırlama Linki Gönder
                <HiOutlineArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <a href="/login" className="text-[#5e0d0f] font-extrabold hover:text-[#D4A373] transition-colors">
            ⬅ Giriş Sayfasına Dön
          </a>
        </div>
      </div>
    </div>
  );
}
