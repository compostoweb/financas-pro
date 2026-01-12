"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, CheckCircle2, Wallet, Info } from "lucide-react"
import { TransactionTable } from "@/components/transaction-table"
import { CreateTransactionDialog } from "@/components/create-transaction-dialog"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"

export default function SocioPage() {
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
      // Filtra especificamente as despesas do Sócio + Datas
      let url = "/api/transactions?type=DESPESA_SOCIO"
      if (dateRange?.from) url += `&startDate=${dateRange.from.toISOString()}`
      if (dateRange?.to) url += `&endDate=${dateRange.to.toISOString()}`
      
      const response = await fetch(url)
      const data = await response.json()
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [dateRange])

  // --- CÁLCULOS ---
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
      
      {/* CABEÇALHO E FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Contas Pessoais - Adriano</h1>
          <p className="text-sm text-slate-500">Despesas pessoais do sócio</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            
            <CreateTransactionDialog 
              onSuccess={fetchTransactions} 
              defaultType="DESPESA_SOCIO" 
            />
        </div>
      </div>

      {/* AVISO AZUL (MANTIDO) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-900 items-start">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
        <div className="text-sm">
            <p className="font-semibold mb-1 text-blue-800">Como isso funciona?</p>
            <p className="text-blue-700/80 leading-relaxed">
                Todas as despesas cadastradas aqui são <span className="font-bold text-black-900">automaticamente somadas</span> e exibidas em duas linhas únicas <span className="font-bold text-black-900">("Retirada Sócio - Adriano (mês vigente) - Pago") e ("Retirada Sócio - Adriano (mês vigente) - Em Aberto"),</span> lá nas Contas a Pagar da Empresa. Isso simplifica o fluxo de caixa da empresa mantendo o detalhe aqui.
            </p>
        </div>
      </div>

      {/* CARDS DE RESUMO DO SÓCIO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pendente (Aberto)</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-slate-400 mt-1">A pagar neste período</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pago</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Retiradas realizadas</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Retiradas</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700">{formatCurrency(totalGeral)}</div>
            <p className="text-xs text-slate-500 mt-1">Soma (Pago + Aberto)</p>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE TRANSAÇÕES */}
      <TransactionTable 
        transactions={transactions} 
        loading={loading} 
        onUpdate={fetchTransactions} 
      />
    </div>
  )
}