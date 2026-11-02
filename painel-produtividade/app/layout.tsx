import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Servlog | Produtividade",
  description: "Ambiente local de validação do frontend Servlog",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="font-sans" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html>;
}
