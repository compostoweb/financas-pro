import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finanças Pro",
  description: "Sistema de Gestão Financeira",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} h-screen bg-slate-50 overflow-hidden`} suppressHydrationWarning={true}>
        {/* Layout Flexível:
           - Mobile: flex-col (Sidebar vira Header no topo -> Conteúdo embaixo)
           - Desktop (md): flex-row (Sidebar na esquerda -> Conteúdo na direita)
        */}
        <div className="flex flex-col md:flex-row h-full w-full">
          
          {/* Sidebar Híbrida (Vira Header no Mobile) */}
          {/* No mobile ela tem altura auto, no desktop ela pega a altura toda */}
          <div className="flex-none z-50">
             <Sidebar />
          </div>

          {/* Área de Conteúdo Principal */}
          <main className="flex-1 overflow-y-auto h-full w-full relative">
            <div className="p-4 md:p-8 max-w-[1800px] mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}