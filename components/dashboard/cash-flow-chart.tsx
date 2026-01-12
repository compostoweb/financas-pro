"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Area, AreaChart, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { 
  format, parseISO, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth, startOfMonth, endOfMonth 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";

interface CashFlowChartProps {
  transactions: any[];
  viewMode: "daily" | "monthly";
  dateRange: DateRange | undefined;
}

export function CashFlowChart({ transactions, viewMode, dateRange }: CashFlowChartProps) {
  const [mounted, setMounted] = useState(false);

  // PEQUENO ATRASO: Garante que o layout CSS (Grid) terminou de desenhar
  useEffect(() => {
    const timer = setTimeout(() => {
        setMounted(true);
    }, 100); 
    return () => clearTimeout(timer);
  }, []);

  const start = dateRange?.from || startOfMonth(new Date());
  const end = dateRange?.to || endOfMonth(new Date());

  let dataSkeleton: any[] = [];
  if (viewMode === "daily") {
    const days = eachDayOfInterval({ start, end });
    dataSkeleton = days.map(day => ({
      dateOriginal: day,
      label: format(day, "dd"), 
      fullDate: format(day, "dd/MM/yyyy"), 
      receita: 0,
      despesa: 0,
    }));
  } else {
    const months = eachMonthOfInterval({ start, end });
    dataSkeleton = months.map(month => ({
      dateOriginal: month,
      label: format(month, "MMM", { locale: ptBR }), 
      fullDate: format(month, "MMMM yyyy", { locale: ptBR }), 
      receita: 0,
      despesa: 0,
    }));
  }

  const chartData = dataSkeleton.map((item) => {
    const dayTransactions = transactions.filter((t) => {
      const tDate = parseISO(t.dueDate as string);
      if (viewMode === "daily") {
        return isSameDay(tDate, item.dateOriginal);
      } else {
        return isSameMonth(tDate, item.dateOriginal);
      }
    });

    const receita = dayTransactions
      .filter((t) => t.type === "RECEITA_EMPRESA")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const despesa = dayTransactions
      .filter((t) => t.type === "DESPESA_EMPRESA") 
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return { ...item, receita, despesa };
  });

  return (
    <Card className="col-span-1 border-none shadow-none">
      <CardHeader className="px-0 pt-0 pb-4"></CardHeader>
      <CardContent className="p-0">
        {/* CORREÇÃO AQUI: Remove FLEX quando montado e usa WIDTH 99% */}
        <div className={`h-[350px] w-full ${!mounted ? "flex items-center justify-center" : "block"}`}>
          
          {!mounted ? (
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
          ) : (
            <ResponsiveContainer width="99%" height="100%">
              {viewMode === "daily" ? (
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    minTickGap={15}
                    dy={10} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$ ${value}`} 
                    width={80} 
                  />
                  <Tooltip 
                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value: number | undefined) => value !== undefined ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) : 'R$ 0,00'}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    name="Receitas" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorReceita)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="despesa" 
                    name="Despesas" 
                    stroke="#ef4444" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorDespesa)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$ ${value}`}
                    width={80} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar 
                    dataKey="receita" 
                    name="Receitas" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={80} 
                  />
                  <Bar 
                    dataKey="despesa" 
                    name="Despesas" 
                    fill="#ef4444" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={80} 
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}