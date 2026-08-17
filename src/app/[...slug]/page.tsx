import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, FileText } from "lucide-react";

const CONTENT: Record<string, { title: string; body: string[] }> = {
  sobre: {
    title: "Sobre nós",
    body: [
      "A OrtoCenter é uma loja especializada em artigos ortopédicos, oferecendo tornozeleiras, joelheiras, braces, crioterapia, bandagens e acessórios das melhores marcas do mercado.",
      "Nosso objetivo é oferecer uma experiência de compra clara, segura e acessível, com informação técnica apresentada de forma responsável.",
      "Trabalhamos com marcas renomadas como Aircast, DonJoy, DJO, Valutrode e Coflex, além da nossa linha própria Endurance.",
    ],
  },
  privacidade: {
    title: "Política de Privacidade (LGPD)",
    body: [
      "Levamos a privacidade a sério. Coletamos apenas os dados necessários para processar pedidos e melhorar sua experiência.",
      "Senhas são armazenadas com hash seguro e nunca em texto puro. A navegação ocorre sob HTTPS.",
      "Você pode solicitar acesso, correção ou exclusão dos seus dados conforme a Lei Geral de Proteção de Dados (LGPD).",
      "Este é um texto de demonstração e não constitui uma política jurídica real.",
    ],
  },
  termos: {
    title: "Termos de Uso",
    body: [
      "Ao utilizar esta loja de demonstração, você concorda com o uso responsável da plataforma.",
      "Os produtos, preços e informações técnicas são fictícios e podem não corresponder a itens reais.",
      "A compatibilidade e a indicação de produtos ortopédicos devem ser confirmadas por um profissional habilitado.",
    ],
  },
  "como-comprar": {
    title: "Como comprar",
    body: [
      "1. Encontre o produto pela busca, categorias ou filtros.",
      "2. Confira as informações técnicas e a compatibilidade.",
      "3. Adicione ao carrinho e finalize em poucas etapas.",
      "4. Escolha o pagamento (Pix, cartão ou boleto) e acompanhe o pedido.",
    ],
  },
  pagamento: {
    title: "Formas de pagamento",
    body: [
      "Aceitamos Pix (aprovação rápida), cartão de crédito em até 12x sem juros e boleto bancário.",
      "Os dados de cartão não são armazenados em nosso banco de dados — o processamento ocorre por gateway seguro.",
    ],
  },
  entrega: {
    title: "Entrega",
    body: [
      "Enviamos para todo o Brasil. O prazo estimado é de até 4 dias de preparação, mais o prazo de transporte (estimado em até 6 dias após o envio).",
      "Os prazos são estimativas e podem variar conforme a transportadora e a região.",
    ],
  },
  trocas: {
    title: "Trocas e devoluções",
    body: [
      "Você pode solicitar troca ou devolução conforme o Código de Defesa do Consumidor.",
      "Produtos de uso pessoal seguem regras específicas de higiene e segurança. Fale com nossa equipe para orientações.",
    ],
  },
  seguranca: {
    title: "Compra segura",
    body: [
      "Utilizamos boas práticas de segurança: HTTPS, senhas com hash, proteção contra ataques comuns e controle de acesso.",
      "Seus dados pessoais, como CPF, não ficam expostos publicamente.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ slug: [slug] }));
}

export default async function InstitucionalPage({ params }: PageProps<"/[...slug]">) {
  const { slug } = await params;
  // Só tratamos páginas institucionais de UM segmento e conhecidas.
  // Qualquer outro caminho (ex.: /products/foo.webp, rotas inexistentes) → 404 real.
  const key = Array.isArray(slug) ? (slug.length === 1 ? slug[0] : "") : slug;
  const page = CONTENT[key];
  if (!page) notFound();

  return (
    <div className="container-app py-8">
      <nav aria-label="Trilha" className="mb-6 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="hover:text-primary">Início</Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-foreground">{page ? page.title : "Página"}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy md:text-3xl">
          <FileText size={26} className="text-primary" /> {page ? page.title : "Página em construção"}
        </h1>
        <div className="mt-5 space-y-3 leading-relaxed text-foreground">
          {page ? (
            page.body.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="text-muted">Este conteúdo ainda está sendo preparado nesta demonstração.</p>
          )}
        </div>
        <div className="mt-8 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          Conteúdo de demonstração. <Link href="/atendimento" className="text-primary hover:underline">Fale com nossa equipe</Link> para mais informações.
        </div>
      </div>
    </div>
  );
}
