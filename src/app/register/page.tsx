'use client';

import { useState } from 'react';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';

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
  
  // Aydınlatma Metni Penceresi (Modal) için State
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="min-h-screen bg-[#F5F0E6] flex items-center justify-center p-4 md:p-6 font-sans relative overflow-hidden">
      {/* Dekoratif Objeler */}
      <div className="absolute top-10 right-0 w-72 h-72 bg-[#D4A373]/10 rounded-full translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-10 left-0 w-72 h-72 bg-[#5e0d0f]/5 rounded-full -translate-x-1/2 blur-3xl"></div>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-lg w-full border border-white relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#5e0d0f] to-[#8a1c1f] rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-[#5e0d0f]/20 mx-auto mb-4">
            🌳
          </div>
          <h2 className="text-3xl font-extrabold text-[#3C2F2F] tracking-tight">Ailemize Katılın</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">En taze lezzetler için hemen üye olun.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* AD SOYAD GRİD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">Ad</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" required value={formData.firstName} 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  placeholder="Adınız"
                  className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3.5 pl-11 pr-4 text-[#3C2F2F] text-sm font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">Soyad</label>
              <input 
                type="text" required value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                placeholder="Soyadınız"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3.5 px-5 text-[#3C2F2F] text-sm font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
              />
            </div>
          </div>

          {/* E-POSTA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">E-Posta Adresi</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" required value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                placeholder="ornek@mail.com"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3.5 pl-11 pr-4 text-[#3C2F2F] text-sm font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
              />
            </div>
          </div>

          {/* ŞİFRE */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-widest px-1">Şifre Oluşturun</label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                placeholder="••••••••"
                className="w-full bg-[#FBF9F4] border border-[#D4A373]/20 rounded-2xl py-3.5 pl-11 pr-4 text-[#3C2F2F] text-sm font-medium focus:ring-2 focus:ring-[#D4A373] outline-none transition-all" 
              />
            </div>
          </div>

          {/* TİCARİ ONAY METNİ */}
          <div className="flex items-start gap-3 p-4 bg-[#FBF9F4] rounded-2xl border border-[#D4A373]/10">
            <div className="relative flex items-center mt-0.5">
              <input 
                type="checkbox" id="marketing_check" 
                checked={formData.commercialMarketingApproved} 
                onChange={(e) => setFormData({...formData, commercialMarketingApproved: e.target.checked})} 
                className="peer appearance-none w-5 h-5 border-2 border-[#D4A373]/30 rounded-md checked:bg-[#5e0d0f] checked:border-[#5e0d0f] transition-all cursor-pointer" 
              />
              <HiOutlineCheck className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none left-0.5" size={16} />
            </div>
            <label htmlFor="marketing_check" className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-medium select-none cursor-pointer">
              Kampanya, indirim ve taze ürün bilgilendirmeleri için iletişim bilgilerime{' '}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[#5e0d0f] font-bold underline decoration-red-600 decoration-2 underline-offset-2 hover:text-[#D4A373] hover:decoration-[#D4A373] transition-all"
              >
                Ticari Elektronik İleti Gönderilmesini
              </button>{' '}
              onaylıyorum.
            </label>
          </div>

          <button 
            type="submit" disabled={loading} 
            className="w-full bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold py-4 rounded-2xl shadow-lg transition-all duration-300 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'İşlem Sürüyor...' : 'Üyeliği Tamamla'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500 font-medium">
            Zaten hesabınız var mı?{' '}
            <a href="/login" className="text-[#5e0d0f] font-extrabold hover:underline decoration-[#D4A373]/50 underline-offset-4">
              Giriş Yapın
            </a>
          </p>
        </div>
      </div>

      {/* ==================== AYDINLATMA METNİ MODAL PENCERESİ ==================== */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)} // Dışarı tıklayınca kapansın
        >
          <div 
            className="bg-white rounded-[2rem] max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 animate-in scale-in duration-200"
            onClick={(e) => e.stopPropagation()} // İçeri tıklayınca kapanmayı engelle
          >
            {/* Modal Başlık */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FBF9F4] rounded-t-[2rem]">
              <h3 className="text-lg font-bold text-[#3C2F2F] flex items-center gap-2">
                📜 Ticari İleti Aydınlatma Metni
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 text-gray-500 transition-colors"
              >
                <HiOutlineXMark size={20} />
              </button>
            </div>

            {/* Modal İçerik (Scroll edilebilir alan) */}
            <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed font-medium">
              <p className="font-bold text-[#3C2F2F]">Değerli Ziyaretçimiz,</p>
              <p>
                <strong>Koca Çınar Şarküteri</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında, sizlere daha iyi bir hizmet sunabilmek amacıyla kişisel verilerinizi işlemekten mutluluk duyuyoruz.
              </p>
              
              <h4 className="font-bold text-[#3C2F2F] pt-2">1. İşlenen Verileriniz ve Amacı</h4>
              <p>
                Üyelik formunda bizimle paylaşmış olduğunuz; ad, soyad ve e-posta adresi gibi iletişim bilgileriniz; firmamıza ait taze ürün duyuruları, özel kampanyalar, dönemsel indirimler, kupon tanımlamaları ve şarküteri dünyamıza ait bültenlerin tarafınıza ulaştırılması amacıyla sınırlı olarak işlenecektir.
              </p>

              <h4 className="font-bold text-[#3C2F2F] pt-2">2. İletişim Kanalları</h4>
              <p>
                Onay vermeniz halinde bilgilendirmeler tarafınıza sistemimizde kayıtlı olan <strong>E-Posta</strong> adresiniz veya entegrasyonu sağlandığı takdirde <strong>SMS / Telefon</strong> kanalları aracılığıyla gerçekleştirilecektir.
              </p>

              <h4 className="font-bold text-[#3C2F2F] pt-2">3. Reddetme Hakkı</h4>
              <p>
                Dilediğiniz an hiçbir gerekçe göstermeksizin bu ticari ileti listesinden çıkma hakkına sahipsiniz. Gönderilen e-postalarda yer alan "Listeden Ayrıl" bağlantısını kullanarak veya profil ayarlarınızdan onayı kaldırarak ticari ileti gönderimini tamamen durdurabilirsiniz. Reddetme talebiniz bize ulaştığı andan itibaren 3 iş günü içinde veri işleme sürecimiz durdurulacaktır.
              </p>

              <p className="text-xs text-gray-400 border-t border-gray-100 pt-4 text-center">
                Verileriniz yasal mevzuata uygun olarak korunmakta ve üçüncü şahıslarla asla paylaşılmamaktadır.
              </p>
            </div>

            {/* Modal Alt Alanı */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="bg-[#5e0d0f] hover:bg-[#D4A373] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                Okudum, Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}