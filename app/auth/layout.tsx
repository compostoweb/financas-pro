import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finanças Pro - Login",
  description: "Sistema de Gestão Financeira",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} h-screen bg-slate-50 overflow-hidden`} suppressHydrationWarning={true}>
        {/* Layout sem sidebar - tela cheia */}
        <main className="w-full h-full">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  )
}
