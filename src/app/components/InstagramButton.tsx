'use client';
import { FaInstagram } from "react-icons/fa6";

export default function InstagramButton() {
  return (
    <a
      href="https://www.instagram.com/kocacinarcifligi?igsh=bm5rdtnpegswexkw"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-[100] w-16 h-16 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 md:hidden"
      aria-label="Instagram sayfamızı ziyaret edin"
    >
      <FaInstagram className="w-9 h-9 text-white drop-shadow-md" />
    </a>
  ); 
}
