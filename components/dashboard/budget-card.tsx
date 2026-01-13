"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Target, AlertTriangle } from "lucide-react"

interface BudgetCardProps {
  transactions: any[]
}

export function BudgetCard({ transactions }: BudgetCardProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        // Filtra apenas categorias que têm orçamento definido (> 0)
        setCategories(data.filter((c: any) => Number(c.budget) > 0))
      })
      .finally(() => setLoading(false))
  }, [])

  // Calcula o gasto atual de cada categoria baseada nas transações recebidas (que já vêm filtradas por data do Dashboard)
  const categorySpending: Record<string, number> = transactions
    .filter(t => t.type === 'DESPESA_EMPRESA' || t.type === 'DESPESA_SOCIO')
    .reduce((acc: any, t) => {
      const catName = t.category || "Sem Categoria"
      acc[catName] = (acc[catName] || 0) + Number(t.amount)
      return acc
    }, {})

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  if (loading) return <div className="h-full flex items-center justify-center text-slate-400">Carregando metas...</div>

  // Se não tem nenhuma categoria com meta definida
  if (categories.length === 0) {
    return (
      <Card className="h-full shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-500" /> Metas de Orçamento
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px] text-center text-slate-500 text-sm">
           <p>Nenhuma meta definida.</p>
           <p className="text-xs mt-1">Vá em "Categorias" para configurar.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full shadow-sm border-slate-200 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" /> 
          Metas de Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto max-h-[350px] pr-2">
        {categories.map((cat) => {
          const spent = categorySpending[cat.name] || 0
          const budget = Number(cat.budget)
          const percentage = Math.min((spent / budget) * 100, 100) // Trava em 100% visualmente
          const isOverBudget = spent > budget

          return (
            <div key={cat.id} className="space-y-2">
              <div className="flex justify-between items-end text-sm">
                <div className="flex items-center gap-2 font-medium text-slate-700">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                   {cat.name}
                </div>
                <div className="text-right">
                   <span className={isOverBudget ? "text-red-600 font-bold" : "text-slate-900 font-bold"}>
                     {formatCurrency(spent)}
                   </span>
                   <span className="text-slate-400 text-xs ml-1">
                     / {formatCurrency(budget)}
                   </span>
                </div>
              </div>
              
              <Progress 
                value={percentage} 
                className="h-2" 
                // Personalizamos a cor da barra direto no estilo ou via classes condicionais
                indicatorClassName={isOverBudget ? "bg-red-500" : "bg-blue-600"}
              />
              
              {isOverBudget && (
                 <p className="text-[10px] text-red-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="h-3 w-3" />
                    Orçamento estourado em {formatCurrency(spent - budget)}
                 </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}