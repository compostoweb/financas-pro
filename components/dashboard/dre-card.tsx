"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export function DreCard({ transactions }: { transactions: any[] }) {
  
  // Cálculos
  const receitaBruta = transactions
    .filter((t) => t.type === "RECEITA_EMPRESA")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const despesas = transactions
    .filter((t) => t.type === "DESPESA_EMPRESA") // Já inclui o sócio pela View
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const resultado = receitaBruta - despesas;

  const format = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">DRE Simplificado</CardTitle>
        <FileText className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        
        {/* Linha Receita */}
        <div className="flex justify-between items-center p-2 bg-emerald-50/50 rounded-md">
          <span className="text-sm font-medium text-emerald-700">Receita Bruta</span>
          <span className="font-bold text-emerald-700">{format(receitaBruta)}</span>
        </div>

        {/* Linha Despesas */}
        <div className="flex justify-between items-center p-2">
          <span className="text-sm font-medium text-red-600">(-) Despesas</span>
          <span className="font-bold text-red-600">-{format(despesas)}</span>
        </div>

        <div className="h-[1px] bg-slate-200 my-2" />

        {/* Resultado */}
        <div className={`flex justify-between items-center p-3 rounded-md ${resultado >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
          <span className="text-sm font-bold text-slate-800">Resultado Líquido</span>
          <span className={`font-bold ${resultado >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
            {format(resultado)}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}