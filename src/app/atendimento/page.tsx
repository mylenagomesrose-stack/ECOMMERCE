import type { Metadata } from "next";
import { MessageCircle, Mail, Phone, Clock, Stethoscope } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Atendimento",
  description: "Fale com a equipe especializada da OrtoCenter.",
};

export default function AtendimentoPage() {
  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-3xl text-center">
        <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-primary-light text-primary-dark"><Stethoscope size={28} /></span>
        <h1 className="mt-4 text-2xl font-extrabold text-navy md:text-3xl">Fale com nossa equipe</h1>
        <p className="mt-2 text-muted">Tire dúvidas sobre produtos, compatibilidade, medidas e pedidos. Nossa equipe ajuda você a escolher com segurança.</p>
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
        <a href={whatsappLink("Olá! Gostaria de falar com a equipe da OrtoCenter.")} target="_blank" rel="noopener noreferrer" className="card card-hover flex flex-col items-center gap-2 p-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366]/15 text-[#128C4A]"><MessageCircle size={24} /></span>
          <p className="font-bold">WhatsApp</p>
          <p className="text-xs text-muted">Atendimento rápido</p>
        </a>
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-light text-primary-dark"><Mail size={24} /></span>
          <p className="font-bold">E-mail</p>
          <p className="text-xs text-muted">contato@endurance.com.br</p>
        </div>
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-light text-primary-dark"><Phone size={24} /></span>
          <p className="font-bold">Telefone</p>
          <p className="text-xs text-muted">(00) 0000-0000</p>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <Clock size={16} /> Segunda a sexta, das 9h às 18h · Sábado, das 9h às 13h
      </div>

      <form className="mx-auto mt-8 grid max-w-2xl gap-4 card p-6" action="#">
        <h2 className="text-lg font-bold">Envie uma mensagem</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <input placeholder="Seu nome" className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
          <input placeholder="Seu e-mail" type="email" className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>
        <input placeholder="Assunto" className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <textarea placeholder="Como podemos ajudar?" rows={4} className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary" />
        <button type="button" className="btn btn-primary py-3 text-sm">Enviar mensagem</button>
        <p className="text-xs text-muted">Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de Privacidade (LGPD).</p>
      </form>
    </div>
  );
}
