'use client';

import { useState } from 'react';
import AnnouncementBar from '@/app/components/AnnouncementBar';
import Navbar from '@/app/components//Navbar';
import WhatsAppButton from '@/app/components/WhatsappButton';
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    commercialMarketingApproved: false,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Bir şeyler ters gitti.' });
      } else {
        setMessage({ type: 'success', text: 'Tebrikler, Koca Çınar Şarküteri ailesine katıldınız!' });
        setFormData({ firstName: '', lastName: '', email: '', password: '', commercialMarketingApproved: false });
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
        <h2 className="text-3xl font-bold text-[#5e0d0f] text-center mb-2">Kayıt Ol</h2>
        <p className="text-center text-gray-600 text-sm mb-6">Hemen üye olun, taze lezzetleri kaçırmayın.</p>

        {message.text && (
          <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Ad</label>
              <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Soyad</label>
              <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">E-Posta Adresi</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Şifre</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-[#5e0d0f]" />
          </div>

          <div className="flex items-start gap-3 pt-2">
            <input type="checkbox" id="marketing_check" checked={formData.commercialMarketingApproved} onChange={(e) => setFormData({...formData, commercialMarketingApproved: e.target.checked})} className="mt-1 w-4 h-4 text-[#5e0d0f] border-gray-300 rounded focus:ring-[#5e0d0f]" />
            <label htmlFor="marketing_check" className="text-xs text-gray-600 leading-tight select-none">
              Koca Çınar Şarküteri tarafından tarafıma kampanya, indirim ve bilgilendirme amaçlı ticari elektronik ileti (SMS, E-posta) gönderilmesini onaylıyorum.
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#5e0d0f] hover:bg-[#4a0a0b] text-white font-semibold p-3 rounded-lg transition-all text-sm mt-4 shadow-md disabled:opacity-50">
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten bir hesabın var mı?{' '}
          <a href="/login" className="text-[#5e0d0f] font-bold hover:underline transition">
            Giriş Yap
          </a>
        </div>
      </div>
    </div>
  );
}