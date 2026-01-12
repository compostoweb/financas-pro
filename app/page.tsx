"use client"

import { useEffect, useState } from "react"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { DreCard } from "@/components/dashboard/dre-card"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bell, Filter } from "lucide-react"
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"

export default function Dashboard() {
  const [allTransactions, setAllTransactions] = useState<any[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  
  // 1. Estado do Filtro de Data (Padrão: Este mês)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  // 2. Estado da Visão (Diária vs Mensal)
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily")

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

  // Efeito de Filtro Poderoso
  useEffect(() => {
    if (!dateRange?.from) {
      setFilteredTransactions(allTransactions) // Se não tem data, mostra tudo
      return
    }

    const filtered = allTransactions.filter(t => {
      // Ajuste de fuso horário simples (considera apenas data UTC)
      const tDate = parseISO(t.dueDate as string)
      
      // Verifica se a data da transação está dentro do range selecionado
      return isWithinInterval(tDate, {
        start: dateRange.from!,
        end: dateRange.to || dateRange.from! // Se não tiver 'to', usa o mesmo dia
      })
    })
    setFilteredTransactions(filtered)
  }, [dateRange, allTransactions])

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR')

  return (
    <div className="space-y-6">
      {/* HEADER: Título e Filtros Alinhados */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            {/* NOVO: Seletor de Visão (Diária/Mensal) */}
            <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                <SelectValue placeholder="Visão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Visão Diária</SelectItem>
                <SelectItem value="monthly">Visão Mensal</SelectItem>
              </SelectContent>
            </Select>

            {/* NOVO: DatePicker com Range */}
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />

            <CreateTransactionDialog onSuccess={fetchTransactions} />
        </div>
      </div>

      {/* CARDS KPI */}
      <OverviewCards transactions={filteredTransactions} />

     {/* ÁREA PRINCIPAL: GRÁFICO */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
      <Card className="h-full border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-800">Fluxo de Caixa</CardTitle>
          <Filter className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          {/* ATUALIZADO: Passando o dateRange para preencher os dias vazios */}
          <CashFlowChart 
             transactions={filteredTransactions} 
             viewMode={viewMode} 
             dateRange={dateRange} 
          />
        </CardContent>
      </Card>
  </div>

        {/* NOTIFICAÇÕES */}
        <Card className="h-full border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium">Notificações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[200px] text-center p-6">
            <div className="bg-emerald-50 p-4 rounded-full mb-4">
              <Bell className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-slate-900">Tudo em dia!</h3>
            <p className="text-sm text-slate-500 mt-2">Nenhuma conta vencendo nos próximos 3 dias.</p>
          </CardContent>
        </Card>
      </div>

      {/* SEGUNDA LINHA: GRÁFICOS SECUNDÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryChart transactions={filteredTransactions} />
          <DreCard transactions={filteredTransactions} />
      </div>

      {/* TABELA */}
      <Card className="border-none shadow-sm">
        <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 5).map((t) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}