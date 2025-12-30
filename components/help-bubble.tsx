import Link from "next/link";
import { MessageCircle, MessageSquareText } from "lucide-react";

export default function WhatsAppFloat() {
  const phoneNumber = "62895328796965"; 
  const message = "Halo PrintKampus, saya butuh bantuan untuk pesanan saya.";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Chat WhatsApp"
    >
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block pointer-events-none">
        Butuh Bantuan?
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
      </div>

      <div className="relative flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 active:scale-95">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 duration-1000"></span>
        
        <div className="relative">
             <MessageCircle className="w-8 h-8 text-white" fill="white" />
        </div>
      </div>
    </Link>
  );
}