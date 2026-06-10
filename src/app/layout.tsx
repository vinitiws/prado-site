import type { Metadata } from "next";
import "./globals.css";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { NavbarVisibility } from "@/components/layout/navbar-visibility";

export const metadata: Metadata = {
  title: {
    template: "%s | Prado Calçados",
    default: "Prado Calçados | Fabricante de Botinas, Botas e Calçados de Segurança Desde 1994",
  },
  description:
    "Desde 1994, a Prado Calçados fabrica botinas e botas de segurança e tradicionais com durabilidade comprovada. Conheça nossa linha completa.",
  metadataBase: new URL("https://www.pradocalcados.com.br"),
  openGraph: {
    title: "Prado Calçados",
    description:
      "A Prado Calçados fabrica botinas, botas e calçados de segurança desde 1994. Produtos resistentes, confortáveis e desenvolvidos para o trabalho e o dia a dia.",
      url: "https://www.pradocalcados.com.br",
    locale: "pt_BR",
    type: "website",
    siteName: "Prado Calçados",
  },
  keywords: [
    "Prado Calçados",
    "Botinas de Segurança",
    "Botas de Segurança",
    "Calçados de Segurança",
    "Calçados Tradicionais",
    "Calçados para Trabalho",
    "Calçados Confortáveis",
    "Calçados Duráveis",
    "botinas",
    "botinas de segurança",
    "botas de segurança",
    "calçados de segurança",
    "fabricante de botinas",
    "botina de couro",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NavbarVisibility />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
