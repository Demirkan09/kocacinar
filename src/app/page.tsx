import { Metadata } from 'next';
import AnasayfaIcerik from './AnasayfaIcerik';

// 🚀 Google Arama Motoru (SEO) ve WhatsApp Paylaşım Ayarları Tamamen Buradan Yönetiliyor
export const metadata: Metadata = {
  title: 'Koca Çınar Şarküteri | Aydın Yöresel & Doğal Gurme Lezzetler',
  description: 'Aydın Efeler’den sofralarınıza taze, katkısız ve yerli şarküteri ürünleri. Kahvaltıların vazgeçilmezleri gurme lezzetler soğuk zincirle kapınızda.',
  keywords: ['aydın şarküteri', 'doğal peynir siparişi', 'yöresel ürünler kapıda ödeme', 'koca çınar çiftliği', 'katkısız zeytinyağı', 'gurme şarküteri', 'koca çınar şarküteri'],

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },           // Ana favicon
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',                     // iOS ve Apple cihazlar için
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },

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