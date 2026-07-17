import { Metadata } from 'next';
import AnasayfaIcerik from './AnasayfaIcerik';

// 🚀 Google Arama Motoru (SEO) ve Favicon Ayarları
export const metadata: Metadata = {
  title: 'Koca Çınar Şarküteri | Aydın Yöresel & Doğal Gurme Lezzetler',
  description: 'Aydın Efeler’den sofralarınıza taze, katkısız ve yerli şarküteri ürünleri. Kahvaltıların vazgeçilmezleri gurme lezzetler soğuk zincirle kapınızda.',
  keywords: ['aydın şarküteri', 'doğal peynir siparişi', 'yöresel ürünler kapıda ödeme', 'koca çınar çiftliği', 'katkısız zeytinyağı', 'gurme şarküteri', 'koca çınar şarküteri'],

  icons: {
    icon: [
      { url: '/icon.ico?v=2', sizes: 'any' },
      { url: '/favicon-96x96.png?v=2', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.ico?v=2',
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180' },
    ],
  },

  other: {
    'apple-mobile-web-app-title': 'Koca Çınar',
  },

  manifest: '/site.webmanifest?v=2',

  openGraph: {
    title: 'Koca Çınar Şarküteri | Gelenekten Geleceğe Doğal Lezzet',
    description: 'Aydın Efeler’den sofralarınıza taze, katkısız ve birinci kalite gurme şarküteri ürünleri.',
    url: 'https://www.kocacinarciftlik.com',
    siteName: 'Koca Çınar Şarküteri',
    images: [
      {
        url: 'https://www.kocacinarciftlik.com/kocacinarlogo.png',
        width: 800,
        height: 600,
        alt: 'Koca Çınar Şarküteri Logo',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
};

export default function Anasayfa() {
  return <AnasayfaIcerik />;
}