"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// Força a sidebar a ser renderizada apenas no cliente (sem SSR)
const Sidebar = dynamic(() => import("@/components/sidebar").then(mod => ({ default: mod.Sidebar })), {
  ssr: false,
  loading: () => (
    <div className="block md:hidden bg-[#0f172a] text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-800 shadow-md">
      <div className="flex items-center gap-2">
        <svg className="h-6 w-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
        </svg>
        <span className="font-bold text-lg">Finanças Pro</span>
      </div>
    </div>
  )
})

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname?.startsWith("/auth")

  if (isAuthRoute) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      <div className="flex-none z-50">
        <Sidebar />
      </div>

      <main className="flex-1 overflow-y-auto h-full w-full relative">
        <div className="p-4 md:p-8 max-w-[1800px] mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  )
}
