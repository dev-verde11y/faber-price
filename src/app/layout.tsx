import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "FABER Price — Calculadora de Precificação 3D",
  description: "Calculadora de custo de impressão 3D e geração de orçamento em PDF.",
};

const ANTI_FLASH_SCRIPT = `(function(){var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${jakarta.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="anti-flash-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: ANTI_FLASH_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <header className="border-b">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
              <span className="font-heading text-lg font-bold text-primary">FABER Price</span>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
