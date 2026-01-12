"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, CheckCircle2, Clock } from "lucide-react"
import { TransactionTable } from "@/components/transaction-table"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { DatePickerWithRange } from "@/components/date-range-picker" // <--- IMPORT
import { startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"

export default function ContasPagarPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // ESTADO DE DATA (Padrão: Este mês)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      // Busca só contas a receber da empresa
      let url = "/api/transactions?type=RECEITA_EMPRESA" // <--- MUDANÇA AQUI
      if (dateRange?.from) url += `&startDate=${dateRange.from.toISOString()}`
      if (dateRange?.to) url += `&endDate=${dateRange.to.toISOString()}`
      
      const response = await fetch(url)
      const data = await response.json()
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  // Recarrega sempre que a data mudar
  useEffect(() => {
    fetchTransactions()
  }, [dateRange])

  // --- CÁLCULOS (Baseados nas transações JÁ filtradas) ---
  const totalPendente = transactions
    .filter(t => t.status === 'EM_ABERTO' || t.status === 'ATRASADO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalPago = transactions
    .filter(t => t.status === 'PAGO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalGeral = transactions
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contas a Receber</h1>
          <p className="text-sm text-slate-500">Gerencie as receitas da empresa</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* SELETOR DE DATA AQUI */}
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            
            <CreateTransactionDialog 
              onSuccess={fetchTransactions} 
              defaultType="DESPESA_EMPRESA" 
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">A Pagar (Aberto)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-slate-400 mt-1">Neste período selecionado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pago</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Já liquidado</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total do Período</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{formatCurrency(totalGeral)}</div>
            <p className="text-xs text-slate-500 mt-1">Soma de tudo</p>
          </CardContent>
        </Card>
      </div>

      <TransactionTable 
        transactions={transactions} 
        loading={loading} 
        onUpdate={fetchTransactions} 
      />
    </div>
  )
}