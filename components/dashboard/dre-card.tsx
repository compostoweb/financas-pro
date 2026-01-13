"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, TrendingUp, TrendingDown, Wallet, ArrowRight, Percent } from "lucide-react"
import Link from "next/link"

interface DreCardProps {
  transactions: any[]
}

export function DreCard({ transactions }: DreCardProps) {
  
  const receitaBruta = transactions
    .filter(t => t.type === 'RECEITA_EMPRESA')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const despesasTotais = transactions
    .filter(t => t.type === 'DESPESA_EMPRESA' || t.type === 'DESPESA_SOCIO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const resultado = receitaBruta - despesasTotais
  
  // Cálculo da Margem: (Lucro / Receita) * 100
  const margem = receitaBruta > 0 ? (resultado / receitaBruta) * 100 : 0

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Card className="h-full shadow-sm border-slate-200 flex flex-col">
      <CardHeader className="pb-4 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            DRE Gerencial
        </CardTitle>
        <Link href="/relatorios/dre">
            <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600 hover:text-blue-800 px-2">
                Ver completo <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center gap-4 pt-6">
        
        {/* Receita */}
        <div className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-600">Receita Bruta</span>
            </div>
            <span className="text-sm font-bold text-emerald-600">{formatCurrency(receitaBruta)}</span>
        </div>

        {/* Despesas */}
        <div className="flex justify-between items-center group">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <TrendingDown className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-600">(-) Despesas</span>
            </div>
            <span className="text-sm font-bold text-red-600">- {formatCurrency(despesasTotais)}</span>
        </div>

        <div className="border-t-2 border-dashed border-slate-100 my-1" />

        {/* Resultado + Margem */}
        <div className={`
            flex justify-between items-center p-4 rounded-xl border shadow-sm transition-all
            ${resultado >= 0 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-red-50 border-red-100'}
        `}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${resultado >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    <Wallet className="h-5 w-5" />
                </div>
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        Resultado Líquido
                    </p>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-xl font-extrabold ${resultado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {formatCurrency(resultado)}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* BADGE DE MARGEM */}
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-medium uppercase mb-0.5">Margem</span>
                <div className="flex items-center bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">
                    <Percent className="h-3 w-3 mr-1 text-slate-400" />
                    <span className={`text-sm font-bold ${margem >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {margem.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  )
}