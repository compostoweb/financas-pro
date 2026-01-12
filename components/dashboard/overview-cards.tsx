"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from "lucide-react";

interface Transaction {
  amount: number;
  type: string;
  status: string;
}

export function OverviewCards({ transactions }: { transactions: Transaction[] }) {
  // 1. Calcular Receitas (Empresa)
  const totalReceitas = transactions
    .filter((t) => t.type === "RECEITA_EMPRESA")
    .reduce((acc, t) => acc + t.amount, 0);

  // 2. Calcular Despesas (Empresa + Resumo Sócio)
  // Como nossa View SQL já transforma as contas do sócio em 'DESPESA_EMPRESA',
  // basta somar tudo que for desse tipo.
  const totalDespesas = transactions
    .filter((t) => t.type === "DESPESA_EMPRESA")
    .reduce((acc, t) => acc + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  // Função para formatar moeda
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Card Receitas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Contas a Receber</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalReceitas)}</div>
          <p className="text-xs text-emerald-600 font-medium flex items-center mt-1">
             +0% vs. mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Card Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Contas a Pagar</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalDespesas)}</div>
          <p className="text-xs text-red-600 font-medium flex items-center mt-1">
             -0% vs. mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Card Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Saldo do Período</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Atualizado agora</p>
        </CardContent>
      </Card>
      
       {/* Card Previsão (Simulado por enquanto) */}
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">Previsão Mensal</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(saldo)}</div>
          <p className="text-xs text-slate-400 mt-1">Projeção estimada</p>
        </CardContent>
      </Card>
    </div>
  );
}