import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "OrtoCenter — Artigos Ortopédicos",
    template: "%s · OrtoCenter",
  },
  description:
    "Loja especializada em artigos ortopédicos: tornozeleiras, joelheiras, braces, crioterapia, bandagens, eletrodos e acessórios das melhores marcas.",
  keywords: ["ortopedia", "tornozeleira", "joelheira", "brace", "crioterapia", "bandagem", "kinesiology", "aircast", "donjoy"],
  metadataBase: new URL("https://ortocenter.demo"),
  openGraph: {
    title: "OrtoCenter — Artigos Ortopédicos",
    description: "Tornozeleiras, joelheiras, braces, crioterapia, bandagens e acessórios ortopédicos das melhores marcas.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <CartProvider>
            <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white">
              Pular para o conteúdo
            </a>
            <Header />
            <main id="conteudo" className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
