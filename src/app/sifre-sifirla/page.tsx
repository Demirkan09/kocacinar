'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HiOutlineLockClosed as HiLock, HiOutlineArrowRight as HiArrow } from 'react-icons/hi2';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage({ type: 'error', text: 'Geçersiz veya eksik şifre sıfırlama anahtarı.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalıdır.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'İşlem başarısız.' });
      } else {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...' });
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-white text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-3xl shadow-sm mx-auto mb-4">
          ⚠️
        </div>
        <h2 className="text-2xl font-extrabold text-[#3C2F2F] tracking-tight">Hata</h2>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
          Geçersiz veya süresi dolmuş bir şifre sıfırlama bağlantısı kullandınız. Lütfen yeni bir bağlantı talep edin.
        </p>
        <div className="mt-8">
          <a href="/sifremi-unuttum" className="inline-block bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold py-3.5 px-8 rounded-2xl shadow-md transition-all">
            Yeni Bağlantı İste
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-white relative z-10">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-[#5e0d0f] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[#5e0d0f]/20 mx-auto mb-4">
          🔒
        </div>
        <h2 className="text-3xl font-extrabold text-[#3C2F2F] tracking-tight">Yeni Şifre Belirle</h2>
        <p className="text-gray-500 text-sm mt-2 font-medium">Hesabınız için yeni ve güvenli bir şifre oluşturun.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] px-1">Yeni Şifre</label>
          <div className="relative">
            <HiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" required value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-12 pr-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-[0.15em] px-1">Yeni Şifre Tekrar</label>
          <div className="relative">
            <HiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" required value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="••••••••"
              className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-4 pl-12 pr-4 text-[#3C2F2F] font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
            />
          </div>
        </div>

        <button 
          type="submit" disabled={loading} 
          className="w-full bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2"
        >
          {loading ? 'Güncelleniyor...' : (
            <>
              Şifreyi Güncelle
              <HiArrow className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function SifreSifirlaPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4 md:p-6 font-sans relative">
      <Suspense fallback={
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-white text-center">
          <div className="w-12 h-12 border-4 border-[#D4A373]/20 border-t-[#5e0d0f] rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-bold text-[#3C2F2F] tracking-wide">Yükleniyor...</div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}