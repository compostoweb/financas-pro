"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

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
