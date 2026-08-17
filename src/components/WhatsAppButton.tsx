"use client";

import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export { whatsappLink };

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Olá! Gostaria de falar com a equipe da OrtoCenter.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com nossa equipe pelo WhatsApp"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#1ebe5b]"
    >
      <MessageCircle size={22} />
      <span className="hidden sm:inline">Fale com nossa equipe</span>
    </a>
  );
}
