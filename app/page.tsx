"use client"

import { useEffect, useState } from "react"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DreCard } from "@/components/dashboard/dre-card"
import { NotificationsCard } from "@/components/dashboard/notifications-card"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react" // Importei X
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { ExportButton } from "@/components/export-button"
import { ImportTransactionDialog } from "@/components/import-transaction-dialog"
import { BudgetCard } from "@/components/dashboard/budget-card" // <--- IMPORT NOVO

export default function Dashboard() {
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  
  // 1. Filtro de Data
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // 2. Visão (Diária vs Mensal)
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily")
  
  // 3. NOVO: Filtro de Categoria (Drill-down)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions")
      const data = await response.json()
      setAllTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Efeito de Filtro Unificado (Data + Categoria)
  useEffect(() => {
    if (!dateRange?.from) {
      setFilteredTransactions(allTransactions) 
      return
    }

    const filtered = allTransactions.filter(t => {
      // 1. Filtro de Data
      const tDate = parseISO(t.dueDate as string)
      const isInData = isWithinInterval(tDate, {
        start: dateRange.from!,
        end: dateRange.to || dateRange.from!
      })

      // 2. Filtro de Categoria (Drill-down)
      // Se tiver categoria selecionada, a transação TEM que ter essa categoria
      const isInCategory = selectedCategory 
        ? (t.category === selectedCategory) 
        : true;

      return isInData && isInCategory
    })
    setFilteredTransactions(filtered)
  }, [dateRange, allTransactions, selectedCategory]) // Adicionado selectedCategory na dependência

  // Função chamada ao clicar no gráfico
  const handleCategoryClick = (categoryName: string) => {
      // Se clicar na mesma, desmarca. Se for vazio, limpa. Senão, seleciona.
      if (selectedCategory === categoryName || categoryName === "") {
          setSelectedCategory(null)
      } else {
          setSelectedCategory(categoryName)
      }
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR')

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="space-y-3 md:space-y-0 md:flex md:flex-row md:justify-between md:items-center md:gap-4">
          <div className="shrink-0">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-xs md:text-sm text-slate-500">Visão geral das suas finanças</p>
          </div>
          
          <div className="w-full md:w-auto space-y-2 md:space-y-0 md:flex md:items-center md:gap-2">
            {/* Filtros em linha no mobile */}
            <div className="flex items-center gap-1 w-full md:w-auto">
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="w-[137.5px] md:w-[140px] bg-slate-50 border-slate-200 h-9 text-[13.8px] md:text-sm shrink-0">
                  <SelectValue placeholder="Visão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Visão Diária</SelectItem>
                  <SelectItem value="monthly">Visão Mensal</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1 min-w-0 md:flex-none md:w-auto">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
            </div>

            {/* Ações em linha separada no mobile */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <ExportButton data={filteredTransactions} className="hidden md:inline-flex" />
              <ImportTransactionDialog onSuccess={fetchTransactions} className="hidden md:inline-flex" />
              <CreateTransactionDialog onSuccess={fetchTransactions} className="w-full md:w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* AVISO DE FILTRO ATIVO (Drill-down) */}
      {selectedCategory && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <span className="text-sm text-slate-500">Filtrando por:</span>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-2">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                  </button>
              </Badge>
          </div>
      )}

      {/* CARDS KPI */}
      <OverviewCards transactions={filteredTransactions} />

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="h-full border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800">Fluxo de Caixa</CardTitle>
                <Filter className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <CashFlowChart 
                   transactions={filteredTransactions} 
                   viewMode={viewMode} 
                   dateRange={dateRange} 
                />
              </CardContent>
            </Card>
        </div>

        <div className="h-full">
           <NotificationsCard transactions={allTransactions} />
        </div>
      </div>

      {/* SEGUNDA LINHA: GRÁFICOS SECUNDÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
          {/* Categoria ocupa 1 espaço */}
          <div className="md:col-span-1">
             <CategoryChart 
                transactions={filteredTransactions} 
                onCategoryClick={handleCategoryClick}
                selectedCategory={selectedCategory}
             />
          </div>

          {/* Budget ocupa 1 espaço */}
          <div className="md:col-span-1">
             <BudgetCard transactions={filteredTransactions} />
          </div>

          {/* DRE ocupa 1 espaço (ou removemos se ficar apertado) */}
          <div className="md:col-span-1">
             <DreCard transactions={filteredTransactions} />
          </div>
      </div>

      {/* TABELA */}
      <Card className="border-none shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>Transações Recentes</span>
                {selectedCategory && <span className="text-sm font-normal text-slate-400">(Categoria: {selectedCategory})</span>}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead> 
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                          Nenhuma transação encontrada com esses filtros.
                      </TableCell>
                  </TableRow>
              ) : (
                filteredTransactions.slice(0, 10).map((t) => (
                    <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell>{formatDate(t.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(t.amount)}</TableCell>
                    <TableCell>
                        <Badge variant={t.status === 'PAGO' ? 'default' : 'destructive'}>
                        {t.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                        {t.type === 'DESPESA_SOCIO' ? 'Sócio' : 
                        t.type === 'RECEITA_EMPRESA' ? 'Receita' : 'Despesa'}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">
                        {t.category || "-"}
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}