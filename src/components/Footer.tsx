import Link from "next/link";
import { Activity, Mail, Phone, MapPin, ShieldCheck, Lock, CreditCard } from "lucide-react";

const cols = [
  {
    title: "Institucional",
    links: [
      ["Sobre nós", "/sobre"],
      ["Contato", "/atendimento"],
      ["Política de privacidade", "/privacidade"],
      ["Termos de uso", "/termos"],
    ],
  },
  {
    title: "Atendimento",
    links: [
      ["Central de atendimento", "/atendimento"],
      ["WhatsApp", "/atendimento"],
      ["E-mail", "/atendimento"],
      ["Horários", "/atendimento"],
    ],
  },
  {
    title: "Compras",
    links: [
      ["Como comprar", "/como-comprar"],
      ["Formas de pagamento", "/pagamento"],
      ["Entrega", "/entrega"],
      ["Trocas e devoluções", "/trocas"],
      ["Acompanhar pedido", "/pedidos"],
    ],
  },
  {
    title: "Segurança",
    links: [
      ["Compra segura", "/seguranca"],
      ["Privacidade", "/privacidade"],
      ["LGPD", "/privacidade"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="container-app grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white"><Activity size={20} strokeWidth={2.5} /></span>
            <span className="text-xl font-extrabold text-white">OrtoCenter</span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed">
            Loja especializada em artigos ortopédicos: tornozeleiras, joelheiras, braces, crioterapia, bandagens e acessórios das melhores marcas.
          </p>
          <div className="mt-4 space-y-1.5 text-sm">
            <p className="flex items-center gap-2"><Phone size={15} /> (00) 0000-0000</p>
            <p className="flex items-center gap-2"><Mail size={15} /> contato@endurance.com.br</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> Atendimento em todo o Brasil</p>
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-6 text-xs md:flex-row">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck size={15} className="text-primary" /> Compra segura</span>
            <span className="flex items-center gap-1.5"><Lock size={15} className="text-primary" /> Dados protegidos (LGPD)</span>
            <span className="flex items-center gap-1.5"><CreditCard size={15} className="text-primary" /> Pix · Cartão · Boleto</span>
          </div>
          <p className="text-center text-white/60">
            © 2026 OrtoCenter — Artigos Ortopédicos. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
