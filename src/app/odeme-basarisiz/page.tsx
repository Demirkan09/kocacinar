"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

// Hata sebeplerini Türkçeye çeviren yardımcı fonksiyon
function getErrorMessage(errorParam: string | null) {
  if (!errorParam) return "Ödeme işlemi sırasında bilinmeyen bir hata meydana geldi.";

  switch (errorParam) {
    case "iyzico_rejected":
    case "Odeme_basarisiz":
      return "Banka veya iyzico altyapısı işlemi onaylamadı. Lütfen kart bilgilerinizi ve limitinizi kontrol edin.";
    case "verification_failed":
    case "Token_bulunamadi":
      return "Ödeme doğrulama işlemi başarısız oldu. Güvenlik nedeniyle işlem iptal edildi.";
    case "server_error":
    case "Sistem_Hatasi":
      return "Sunucu kaynaklı anlık bir problem oluştu. Lütfen birazdan tekrar deneyin.";
    default:
      // Eğer sistemden okunabilir, özel bir mesaj gönderilirse (boşlukları _ ile değiştirilmiş olabilir) onu çözüp gösteririz
      return decodeURIComponent(errorParam).replace(/_/g, ' ');
  }
}

// URL paramlarını okuyan alt bileşen
function OdemeBasarisizIcerik() {
  const searchParams = useSearchParams();
  // Hem senin önceki "reason" yapını hem de route.ts'den gelen "error" yapısını yakalar
  const errorParam = searchParams.get("error") || searchParams.get("reason");
  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-red-500">
      {/* Başarısız İkonu */}
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Ödeme Başarısız</h1>
      
      <p className="text-gray-600 mb-2 leading-relaxed">
        Siparişinizi tamamlarken maalesef bir sorunla karşılaştık.
      </p>

      {/* Hata Sebebi Kutusu */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8 mt-4 text-left">
        <h3 className="text-red-800 font-semibold mb-1 text-sm">Hata Detayı:</h3>
        <p className="text-red-600 text-sm">{errorMessage}</p>
      </div>

      <Link href="/sepet">
        <button className="w-full bg-[#2A2020] hover:bg-[#5e0d0f] transition-colors text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Sepetime Geri Dön
        </button>
      </Link>
    </div>
  );
}

// Ana sayfa bileşeni (Suspense ile sarılmış)
export default function OdemeBasarisiz() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <OdemeBasarisizIcerik />
      </Suspense>
    </div>
  );
}