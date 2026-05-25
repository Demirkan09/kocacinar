'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
  unit: string; // Opsiyonel olmasın, varsayılan atayacağız
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void; // Burası 'any' kalsın veya aşağıdakini yap
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  showToast: boolean;
  toastMessage: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Sayfa ilk yüklendiğinde LocalStorage'dan sepeti çek
  useEffect(() => {
    const savedCart = localStorage.getItem('kocacinar_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  // Sepet her değiştiğinde LocalStorage'ı güncelle
  useEffect(() => {
    localStorage.setItem('kocacinar_cart', JSON.stringify(cart));
  }, [cart]);

  // ✅ DEĞİŞEN KISIM: Toplam adet yerine sepetteki benzersiz ürün çeşidi sayısını alıyoruz
  const cartCount = cart.length;

  // Sepete Ürün Ekleme ve Sağ Altta Baloncuk Çıkarma Fonksiyonu
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, unit: product.unit || 'kg' }];
    });

    // Premium Baloncuk Tetikleme (Müşteriyi rahatsız etmeyen uyarı)
    setToastMessage(`"${product.name}" sepete eklendi ✅`);
    setShowToast(true);
  };

  // Baloncuğu 2.5 saniye sonra otomatik kapat
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, showToast, toastMessage }}>
      {children}
      
      {/* ================= SAĞ ALT PREMIUM BİLDİRİM BALONCUĞU (TOAST) ================= */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3C2F2F] text-white px-6 py-4 rounded-2xl shadow-2xl border border-[#D4A373]/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <p className="text-sm font-bold tracking-wide">{toastMessage}</p>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart bir CartProvider içinde kullanılmalıdır.');
  return context;
}