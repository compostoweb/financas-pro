"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Printer, Settings as SettingsIcon } from "lucide-react"
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { DreHelpSheet } from "./dre-help-sheet"

export default function DrePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  
  // CONFIGURAÇÕES FISCAIS
  const [taxRegime, setTaxRegime] = useState("SIMPLES")
  const [taxes, setTaxes] = useState({
      simplesRate: 6.0,    
      pisCofins: 3.65,     
      iss: 5.0,            
      irpjBase: 32.0,      
      irpjRate: 15.0,
      csllRate: 9.0,
      useTransition2026: false 
  })

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  useEffect(() => {
    fetch("/api/transactions").then(res => res.json()).then(setTransactions)
  }, [])

  // --- CÁLCULOS DO DRE ---

  const filtered = transactions.filter(t => {
     if (!dateRange?.from) return true
     return isWithinInterval(parseISO(t.dueDate), {
        start: dateRange.from,
        end: dateRange.to || dateRange.from
     })
  })

  // 1. RECEITA
  const receitaBruta = filtered
    .filter(t => t.type === 'RECEITA_EMPRESA')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  // 2. DEDUÇÕES
  let deducoesImpostos = 0
  let impostosLabel = ""
  let aliquotaTotal = 0

  if (taxRegime === "SIMPLES") {
      aliquotaTotal = taxes.simplesRate
      impostosLabel = `Simples Nacional (${taxes.simplesRate}%)`
  } else {
      aliquotaTotal = taxes.pisCofins + taxes.iss
      impostosLabel = `Impostos s/ Venda`
  }

  if (taxes.useTransition2026) {
      aliquotaTotal += 1.0 
      impostosLabel += ` + CBS/IBS (1%)`
  }

  if (taxRegime === "SIMPLES" && taxes.useTransition2026) {
       impostosLabel = `Simples + CBS/IBS (${aliquotaTotal}%)`
  } else if (taxRegime !== "SIMPLES") {
       impostosLabel += ` (${aliquotaTotal}%)`
  }

  deducoesImpostos = receitaBruta * (aliquotaTotal / 100)
  const receitaLiquida = receitaBruta - deducoesImpostos

  // 3. DESPESAS
  const despesasOperacionais = filtered
    .filter(t => t.type === 'DESPESA_EMPRESA')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const lucroOperacional = receitaLiquida - despesasOperacionais

  // 4. IMPOSTOS LUCRO
  let irpjCsll = 0
  if (taxRegime === "PRESUMIDO") {
      const baseCalculo = receitaBruta * (taxes.irpjBase / 100)
      irpjCsll += baseCalculo * (taxes.irpjRate / 100) 
      irpjCsll += baseCalculo * (taxes.csllRate / 100) 
  } else if (taxRegime === "REAL") {
      if (lucroOperacional > 0) {
          irpjCsll += lucroOperacional * (taxes.irpjRate / 100)
          irpjCsll += lucroOperacional * (taxes.csllRate / 100)
      }
  }

  const resultadoLiquidoExercicio = lucroOperacional - irpjCsll

  // 5. SÓCIO
  const retiradasSocio = filtered
    .filter(t => t.type === 'DESPESA_SOCIO')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  const calcAV = (val: number) => 
    receitaBruta > 0 ? ((val / receitaBruta) * 100).toFixed(1) + "%" : "0%"

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-10 px-1 md:px-6">
      
      {/* HEADER ADAPTÁVEL AO MOBILE (flex-col no mobile, flex-row no desktop) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-4">
        
        <div className="flex items-center gap-2 w-full lg:w-auto">
            <Link href="/"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
            <div className="flex-1 lg:flex-none">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">DRE Gerencial</h1>
                <p className="text-xs md:text-sm text-slate-500 flex flex-wrap gap-2 items-center mt-1">
                    <span>Regime: <span className="font-semibold text-blue-600">{taxRegime.replace('_', ' ')}</span></span>
                    {taxes.useTransition2026 && (
                        <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                            Piloto 2026
                        </span>
                    )}
                </p>
            </div>
        </div>
        
        {/* CONTROLES EMPILHADOS NO MOBILE */}
        <div className="flex flex-col sm:flex-row sm:w-auto gap-2 w-full lg:w-auto print:hidden">
             <div className="w-full sm:w-auto">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
             </div>
             
             {/* BOTÕES DE AÇÃO WRAPPER */}
             <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <DreHelpSheet />

                {/* MODAL DE CONFIGURAÇÃO */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="whitespace-nowrap flex-1 sm:flex-none">
                            <SettingsIcon className="mr-2 h-4 w-4" /> 
                            <span className="hidden sm:inline">Configurar</span> Impostos
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] w-[95vw]">
                        <DialogHeader>
                            <DialogTitle>Configuração Tributária</DialogTitle>
                        </DialogHeader>
                        {/* CONTEÚDO DO MODAL DE CONFIG (MESMO DE ANTES) */}
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Regime Tributário</Label>
                                <Select value={taxRegime} onValueChange={setTaxRegime}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SIMPLES">Simples Nacional</SelectItem>
                                        <SelectItem value="PRESUMIDO">Lucro Presumido</SelectItem>
                                        <SelectItem value="REAL">Lucro Real</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {taxRegime === "SIMPLES" && (
                                <div className="grid gap-2">
                                    <Label>Alíquota Efetiva (DAS) %</Label>
                                    <Input type="number" value={taxes.simplesRate} onChange={e => setTaxes({...taxes, simplesRate: Number(e.target.value)})} />
                                    <p className="text-xs text-slate-500">Consulte o Anexo da sua atividade.</p>
                                </div>
                            )}

                            {taxRegime !== "SIMPLES" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>PIS/COFINS (%)</Label>
                                            <Input type="number" value={taxes.pisCofins} onChange={e => setTaxes({...taxes, pisCofins: Number(e.target.value)})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>ISS (%)</Label>
                                            <Input type="number" value={taxes.iss} onChange={e => setTaxes({...taxes, iss: Number(e.target.value)})} />
                                        </div>
                                    </div>
                                    {taxRegime === "PRESUMIDO" && (
                                        <div className="grid gap-2">
                                            <Label>Base de Presunção (%)</Label>
                                            <Input type="number" value={taxes.irpjBase} onChange={e => setTaxes({...taxes, irpjBase: Number(e.target.value)})} />
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Reforma Tributária (2026)</Label>
                                    <p className="text-xs text-slate-500">Adicionar CBS (0.9%) e IBS (0.1%)</p>
                                </div>
                                <Switch checked={taxes.useTransition2026} onCheckedChange={c => setTaxes({...taxes, useTransition2026: c})} />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" size="icon" onClick={() => window.print()} className="hidden sm:flex">
                    <Printer className="h-4 w-4" />
                </Button>
             </div>
        </div>
      </div>

      {/* RELATÓRIO DRE COM SCROLL HORIZONTAL */}
      <Card className="min-h-[600px] shadow-lg print:shadow-none print:border-none overflow-hidden">
        <CardHeader className="bg-slate-900 text-white py-6 text-center">
            <CardTitle className="uppercase tracking-widest text-lg md:text-xl">Demonstração do Resultado</CardTitle>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
                {dateRange?.from?.toLocaleDateString()} a {dateRange?.to?.toLocaleDateString()}
            </p>
        </CardHeader>
        
        {/* WRAPPER PARA SCROLL HORIZONTAL NO MOBILE */}
        <div className="overflow-x-auto">
            <CardContent className="p-0 min-w-[600px]"> 
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[55%] pl-4 md:pl-8 font-bold text-slate-700 uppercase text-xs md:text-sm">Descrição</TableHead>
                            <TableHead className="text-right pr-4 md:pr-8 font-bold text-slate-700 uppercase text-xs md:text-sm">Valor</TableHead>
                            <TableHead className="text-right pr-4 md:pr-8 font-bold text-slate-700 w-[100px] uppercase text-xs md:text-sm">% AV</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        
                        {/* 1. RECEITA BRUTA */}
                        <TableRow className="hover:bg-slate-50">
                            <TableCell className="pl-4 md:pl-8 font-bold text-blue-900 text-sm md:text-lg py-4 whitespace-nowrap">(=) RECEITA OPERACIONAL BRUTA</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-bold text-blue-900 text-sm md:text-lg whitespace-nowrap">{formatCurrency(receitaBruta)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-bold text-blue-900 text-sm md:text-base">100%</TableCell>
                        </TableRow>

                        {/* 2. DEDUÇÕES */}
                        <TableRow className="hover:bg-slate-50 bg-red-50/10">
                            <TableCell className="pl-4 md:pl-8 text-slate-600 py-2 text-xs md:text-sm whitespace-nowrap">(-) {impostosLabel}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-red-600 text-xs md:text-sm whitespace-nowrap">- {formatCurrency(deducoesImpostos)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-slate-400 text-[10px] md:text-xs">{calcAV(deducoesImpostos)}</TableCell>
                        </TableRow>

                        {/* = RECEITA LÍQUIDA */}
                        <TableRow className="bg-slate-100 font-semibold border-t border-slate-200">
                            <TableCell className="pl-4 md:pl-8 text-slate-800 py-3 text-xs md:text-base whitespace-nowrap">(=) RECEITA LÍQUIDA</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-slate-800 text-xs md:text-base whitespace-nowrap">{formatCurrency(receitaLiquida)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-slate-800 text-xs md:text-base">{calcAV(receitaLiquida)}</TableCell>
                        </TableRow>

                        {/* 3. DESPESAS */}
                        <TableRow className="hover:bg-slate-50 mt-4">
                            <TableCell className="pl-4 md:pl-8 font-bold text-slate-700 pt-4 text-xs md:text-base whitespace-nowrap">(-) CUSTOS E DESPESAS OPERACIONAIS</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-bold text-red-700 pt-4 text-xs md:text-base whitespace-nowrap">- {formatCurrency(despesasOperacionais)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-bold text-red-700 pt-4 text-xs md:text-base">{calcAV(despesasOperacionais)}</TableCell>
                        </TableRow>

                        {/* = RESULTADO ANTES DO IR */}
                        <TableRow className="bg-slate-50 font-semibold border-t border-slate-200">
                            <TableCell className="pl-4 md:pl-8 text-slate-800 py-3 text-xs md:text-sm whitespace-nowrap">(=) RESULTADO ANTES IRPJ/CSLL (LAIR)</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-slate-800 text-xs md:text-sm whitespace-nowrap">{formatCurrency(lucroOperacional)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-slate-800 text-xs md:text-sm">{calcAV(lucroOperacional)}</TableCell>
                        </TableRow>

                        {/* 4. IRPJ / CSLL */}
                        {taxRegime !== "SIMPLES" && (
                            <TableRow className="hover:bg-slate-50 bg-red-50/10">
                                <TableCell className="pl-4 md:pl-8 text-slate-600 py-2 text-xs md:text-sm whitespace-nowrap">(-) Provisão IRPJ e CSLL</TableCell>
                                <TableCell className="text-right pr-4 md:pr-8 text-red-600 text-xs md:text-sm whitespace-nowrap">- {formatCurrency(irpjCsll)}</TableCell>
                                <TableCell className="text-right pr-4 md:pr-8 text-slate-400 text-[10px] md:text-xs">{calcAV(irpjCsll)}</TableCell>
                            </TableRow>
                        )}

                        {/* = RESULTADO LÍQUIDO DO EXERCÍCIO */}
                        <TableRow className="bg-emerald-100 border-t-2 border-emerald-500">
                            <TableCell className="pl-4 md:pl-8 font-extrabold text-emerald-900 text-sm md:text-xl py-6 whitespace-nowrap">(=) RESULTADO LÍQUIDO DO EXERCÍCIO</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-extrabold text-emerald-900 text-sm md:text-xl whitespace-nowrap">{formatCurrency(resultadoLiquidoExercicio)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-extrabold text-emerald-900 text-xs md:text-base">{calcAV(resultadoLiquidoExercicio)}</TableCell>
                        </TableRow>

                        {/* SEÇÃO EXTRA: SÓCIO */}
                        <TableRow className="bg-slate-50 border-t-4 border-white">
                            <TableCell colSpan={3} className="py-2"></TableCell>
                        </TableRow>
                        <TableRow className="bg-orange-50/50">
                            <TableCell className="pl-4 md:pl-8 font-bold text-orange-900 py-3 text-xs md:text-base whitespace-nowrap">(-) RETIRADAS DE SÓCIOS (Não Operacional)</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 font-bold text-orange-700 text-xs md:text-base whitespace-nowrap">- {formatCurrency(retiradasSocio)}</TableCell>
                            <TableCell className="text-right pr-4 md:pr-8 text-orange-700 text-[10px] md:text-xs">{calcAV(retiradasSocio)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </div>
      </Card>
    </div>
  )
}