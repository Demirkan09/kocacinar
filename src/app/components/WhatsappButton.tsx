'use client';
import { FaWhatsapp } from "react-icons/fa";
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/905513404848"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[100] w-16 h-16 bg-[#25D366] hover:bg-[#20C25A] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
      aria-label="WhatsApp ile sipariş ver"
    >
      <FaWhatsapp className="w-9 h-9 text-white drop-shadow-md" />
    </a>
  );
}