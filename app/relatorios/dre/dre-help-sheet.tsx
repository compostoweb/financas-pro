"use client"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Calculator, AlertTriangle, BookOpen } from "lucide-react"

export function DreHelpSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
            variant="outline" 
            className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 shadow-sm transition-all"
        >
            <BookOpen className="h-4 w-4" />
            Entenda os Cálculos
        </Button>
      </SheetTrigger>

      {/* AJUSTE AQUI: Mudado de 750px para 600px */}
      <SheetContent className="w-[90vw] sm:max-w-[600px] bg-white p-0">
        <SheetHeader className="p-6 pb-4 bg-slate-50 border-b border-slate-100">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5 text-blue-600" />
            Guia de Cálculos do DRE
          </SheetTitle>
          <SheetDescription className="text-sm">
            Entenda a lógica por trás dos impostos e resultados de cada regime.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] p-6">
            <Tabs defaultValue="simples" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="simples">Simples</TabsTrigger>
                    <TabsTrigger value="presumido">Presumido</TabsTrigger>
                    <TabsTrigger value="real">Real</TabsTrigger>
                </TabsList>

                {/* --- ABA SIMPLES NACIONAL --- */}
                <TabsContent value="simples" className="space-y-6 animate-in fade-in-50">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-900 shadow-sm text-sm">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                            Conceito
                        </h4>
                        <p className="leading-relaxed">
                            O Simples Nacional unifica 8 impostos em uma única guia (DAS). A alíquota incide diretamente sobre o Faturamento Bruto mensal.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-900 border-l-4 border-blue-500 pl-3 text-sm">Fórmula Básica</h3>
                            <div className="bg-slate-900 text-slate-50 p-3 rounded-lg font-mono text-xs shadow-md">
                                Imposto = Receita Bruta x Alíquota Efetiva
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-slate-900 border-l-4 border-emerald-500 pl-3 text-sm">Exemplo Prático</h3>
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                <div className="flex justify-between mb-1 border-b border-slate-100 pb-1">
                                    <span>Receita do Mês:</span>
                                    <span className="font-bold">R$ 10.000,00</span>
                                </div>
                                <div className="flex justify-between mb-3 border-b border-slate-100 pb-1">
                                    <span>Alíquota (Anexo III):</span>
                                    <span className="font-bold text-blue-600">6%</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded text-center font-medium text-slate-700">
                                    10.000 x 0,06 = <span className="text-emerald-600 font-bold">R$ 600,00 (DAS)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* --- ABA LUCRO PRESUMIDO --- */}
                <TabsContent value="presumido" className="space-y-6 animate-in fade-in-50">
                     <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-orange-900 shadow-sm text-sm">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <span className="bg-orange-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                            Conceito
                        </h4>
                        <p className="leading-relaxed">
                            O governo "presume" um lucro fixo (ex: 32% para serviços) e cobra IRPJ/CSLL sobre essa base, ignorando seu lucro real.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-3 border rounded-xl bg-white shadow-sm text-sm">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"/> 1. Impostos s/ Venda
                            </h3>
                            <p className="text-xs text-slate-500 mb-2">PIS, COFINS e ISS incidem direto na nota.</p>
                            <div className="bg-slate-100 p-2 rounded text-center font-medium border border-slate-200">
                                Ex: 10k x 8,65% = <strong>R$ 865,00</strong>
                            </div>
                        </div>

                        <div className="p-3 border rounded-xl bg-white shadow-sm text-sm">
                            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"/> 2. Impostos s/ Lucro
                            </h3>
                            <div className="bg-slate-50 p-3 rounded-lg space-y-2 font-mono text-slate-600 text-xs">
                                <div className="flex justify-between">
                                    <span>Base (32% de 10k):</span>
                                    <span className="font-bold">R$ 3.200</span>
                                </div>
                                <div className="border-t border-slate-200 my-1"></div>
                                <div className="flex justify-between text-red-600">
                                    <span>IRPJ (15%) + CSLL (9%):</span>
                                    <span>- R$ 768,00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                 {/* --- ABA LUCRO REAL --- */}
                 <TabsContent value="real" className="space-y-6 animate-in fade-in-50">
                     <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-900 shadow-sm text-sm">
                        <h4 className="font-bold mb-2 flex items-center gap-2">
                            <span className="bg-emerald-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">$</span>
                            Conceito
                        </h4>
                        <p className="leading-relaxed">
                            IRPJ e CSLL são cobrados sobre o <strong>Lucro Contábil Real</strong>. Se houver prejuízo, não paga esses impostos.
                        </p>
                    </div>

                    <div className="space-y-4">
                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm space-y-2">
                             <div className="flex justify-between items-center text-xs">
                                 <span className="font-medium text-slate-600">(+) Receita</span>
                                 <span className="font-bold text-slate-800">R$ 10.000</span>
                             </div>
                             <div className="flex justify-between items-center text-xs text-red-500 bg-red-50 p-1.5 rounded">
                                 <span>(-) Impostos + Despesas</span>
                                 <span>- R$ 5.925</span>
                             </div>
                             <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                 <span className="font-bold text-blue-900">(=) Lucro Real (LAIR)</span>
                                 <span className="font-bold text-blue-900">R$ 4.075</span>
                             </div>
                        </div>
                        
                        <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 border border-slate-200 text-center">
                            Imposto incide sobre os <strong>R$ 4.075</strong> (Lucro),<br/>e não sobre a Receita Bruta.
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* --- SEÇÃO GLOBAL: REFORMA 2026 --- */}
            <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex flex-col gap-3 bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-2 text-purple-800">
                        <AlertTriangle className="h-5 w-5" />
                        <h4 className="font-bold text-sm">Reforma Tributária (2026)</h4>
                    </div>
                    
                    <p className="text-xs text-purple-800/80 leading-relaxed">
                        Fase de testes do <strong>IVA Dual</strong>. Haverá destaque na nota fiscal para todos os regimes:
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2 rounded border border-purple-200 text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-purple-500 font-bold">Federal (CBS)</span>
                            <span className="font-bold text-base text-purple-700">0,9%</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-purple-200 text-center">
                            <span className="block text-[10px] uppercase tracking-wider text-purple-500 font-bold">Estadual (IBS)</span>
                            <span className="font-bold text-base text-purple-700">0,1%</span>
                        </div>
                    </div>

                    <p className="text-[10px] opacity-70 bg-purple-200/50 p-2 rounded text-center">
                        Ao ativar o "Modo Piloto 2026", o sistema soma 1% nas deduções.
                    </p>
                </div>
            </div>

        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}