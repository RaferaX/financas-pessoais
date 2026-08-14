import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Finanças+",
  description: "Controle financeiro pessoal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-[#0A0D12] text-[#EDEFF2] [font-family:var(--font-body)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}