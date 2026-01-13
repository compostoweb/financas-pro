"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  User, 
  Tags,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";

// Definição dos itens do menu (Reutilizável)
const sidebarItems = [
  {
    group: "PRINCIPAL",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "EMPRESA",
    items: [
      { href: "/empresa/pagar", label: "Contas a Pagar", icon: ArrowDownCircle, iconColor: "text-orange-400", borderColor: "border-orange-400" },
      { href: "/empresa/receber", label: "Contas a Receber", icon: ArrowUpCircle, iconColor: "text-emerald-400", borderColor: "border-emerald-400" },
      { label: "Relatório DRE", icon: FileText, href: "/relatorios/dre", color: "text-orange-500" }, // <--- NOVO
    ],
  },
  {
    group: "SÓCIO",
    items: [
      { href: "/socio", label: "Adriano - Pessoal", icon: User },
    ],
  },
  {
    group: "CONFIGURAÇÕES",
    items: [
      { href: "/categorias", label: "Categorias", icon: Tags },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  // Detectar mudança de tamanho de tela para ajuste responsivo
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // 768px é o breakpoint 'md' do Tailwind
    };
    
    // Checa ao carregar e ao redimensionar
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Conteúdo do Menu (Links) - Extraído para reuso
  const MenuContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Area */}
      <div className={cn("p-6 flex items-center", isCollapsed && !isMobile ? "justify-center p-4" : "gap-2")}>
        <PieChart className="h-8 w-8 text-emerald-400 shrink-0" />
        {(!isCollapsed || isMobile) && (
          <div>
            <span className="text-white font-bold text-xl block">Finanças Pro</span>
            <span className="text-xs text-slate-500">Gestão Financeira</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto py-4">
        {sidebarItems.map((group) => (
          <div key={group.group}>
            {(!isCollapsed || isMobile) && (
              <h3 className="text-[10px] font-bold text-slate-300 mb-2 px-4 tracking-wider uppercase">
                {group.group}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setOpenMobile(false)} // Fecha menu ao clicar no mobile
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive
                          ? `bg-slate-800 text-white shadow-sm border-l-4 ${item.borderColor || "border-emerald-500"}`
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-white",
                        isCollapsed && !isMobile && "justify-center px-2"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 shrink-0", 
                        item.iconColor || (isActive ? "text-emerald-400" : "text-slate-400")
                      )} />
                      {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / User Info */}
      <div className={cn("p-4 border-t border-slate-800 bg-[#0b1120]", isCollapsed && !isMobile && "flex justify-center")}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            AD
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="text-sm overflow-hidden">
              <p className="text-white font-medium truncate">Adriano</p>
              <p className="text-xs text-slate-400">Sócio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- RENDERIZAÇÃO MOBILE (HEADER + DRAWER) ---
  if (isMobile) {
    return (
      <div className="bg-[#0f172a] text-white p-4 flex justify-between items-center sticky top-0 z-50 border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-2">
          <PieChart className="h-6 w-6 text-emerald-400" />
          <span className="font-bold text-lg">Finanças Pro</span>
        </div>
        
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          {/* side="left" faz abrir da esquerda para direita */}
          <SheetContent side="left" className="p-0 bg-[#0f172a] border-slate-800 w-full max-w-[300px] text-slate-300">
             {/* Adicionado SheetTitle para acessibilidade (Screen Readers) */}
            <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
            
            
            
            <MenuContent />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DESKTOP (SIDEBAR LATERAL) ---
  return (
    <aside 
      className={cn(
        "bg-[#0f172a] text-slate-300 flex flex-col h-full border-r border-slate-800 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Botão de Colapsar (Só aparece no Desktop) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-9 h-6 w-6 rounded-full bg-emerald-500 text-white shadow-md hover:bg-emerald-600 z-50 hidden md:flex items-center justify-center border border-[#0f172a]"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <MenuContent />
    </aside>
  );
}