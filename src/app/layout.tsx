import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export const metadata: Metadata = {
  title: {
    template: "%s | Prado Calçados",
    default: "Prado Calçados - Botinas e Botas de Qualidade Desde 1994",
  },
  description:
    "Desde 1994, a Prado Calçados fabrica botinas e botas de segurança e tradicionais com durabilidade comprovada. Conheça nossa linha completa.",
  metadataBase: new URL("https://www.pradocalcados.com.br"),
  openGraph: {
    title: "Prado Calçados",
    description:
      "Botinas e Botas de Qualidade Desde 1994. Tradição e Tecnologia em cada par.",
    locale: "pt_BR",
    type: "website",
    siteName: "Prado Calçados",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
