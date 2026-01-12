"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, AlertCircle, CalendarClock, CheckCircle2, AlertTriangle } from "lucide-react"
import { differenceInDays, isPast, isToday, isTomorrow, parseISO, startOfDay } from "date-fns"

export function NotificationsCard({ transactions }: { transactions: any[] }) {
  
  // 1. Filtrar apenas o que está EM ABERTO (Contas a Pagar apenas)
  const openBills = transactions.filter(t => 
    (t.type === 'DESPESA_EMPRESA' || t.type === 'DESPESA_SOCIO') && 
    (t.status === 'EM_ABERTO' || t.status === 'ATRASADO')
  )

  const today = startOfDay(new Date())

  // 2. Classificar as notificações
  const alerts = openBills.map(bill => {
    const dueDate = parseISO(bill.dueDate)
    const diff = differenceInDays(dueDate, today)

    // Atrasado (Data passada e não é hoje)
    if (diff < 0) {
      return {
        id: bill.id,
        type: 'overdue',
        title: bill.description,
        amount: bill.amount,
        message: `Venceu há ${Math.abs(diff)} dia(s)`,
        icon: AlertCircle,
        color: "text-red-500",
        bg: "bg-red-50",
        border: "border-red-100"
      }
    }
    
    // Vence Hoje
    if (diff === 0) {
      return {
        id: bill.id,
        type: 'today',
        title: bill.description,
        amount: bill.amount,
        message: "Vence hoje!",
        icon: AlertTriangle,
        color: "text-orange-500",
        bg: "bg-orange-50",
        border: "border-orange-100"
      }
    }

    // Vence nos próximos 3 dias
    if (diff > 0 && diff <= 3) {
      return {
        id: bill.id,
        type: 'upcoming',
        title: bill.description,
        amount: bill.amount,
        message: isTomorrow(dueDate) ? "Vence amanhã" : `Vence em ${diff} dias`,
        icon: CalendarClock,
        color: "text-blue-500",
        bg: "bg-blue-50",
        border: "border-blue-100"
      }
    }

    return null
  }).filter(Boolean) // Remove os nulos (contas que vencem longe)

  // Ordenar por urgência: Atrasados primeiro, depois Hoje, depois Futuro
  alerts.sort((a, b) => {
    const priority = { overdue: 0, today: 1, upcoming: 2 }
    // @ts-ignore
    return priority[a.type] - priority[b.type]
  })

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val))

  return (
    <Card className="col-span-1 h-full shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
            Notificações
            {alerts.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {alerts.length}
                </span>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            // ESTADO "TUDO EM DIA" (IGUAL À IMAGEM)
            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-slate-900">Tudo em dia!</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-[180px]">
                Nenhuma conta vencendo nos próximos 3 dias.
              </p>
            </div>
          ) : (
            // LISTA DE ALERTAS
            alerts.map((alert: any) => (
              <div 
                key={alert.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border ${alert.border} ${alert.bg} transition-all hover:opacity-90`}
              >
                <div className={`mt-0.5 p-1.5 rounded-full bg-white ${alert.color} shadow-sm`}>
                    <alert.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{alert.title}</p>
                    <p className={`text-xs font-medium ${alert.color}`}>{alert.message}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{formatCurrency(alert.amount)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}