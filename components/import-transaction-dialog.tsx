"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, Save, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function ImportTransactionDialog({ onSuccess, className }: { onSuccess: () => void; className?: string }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1) 
  const [fileData, setFileData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  
  const [mapping, setMapping] = useState({
    description: "",
    amount: "",
    dueDate: "",
    category: "", 
    status: "",
  })

  const [defaultType, setDefaultType] = useState<string>("DESPESA_EMPRESA")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    
    reader.onload = (evt) => {
      const arrayBuffer = evt.target?.result
      
      // ADICIONADO: codepage: 65001 força a leitura em UTF-8 para corrigir acentos
      const wb = XLSX.read(arrayBuffer, { type: "array", codepage: 65001 })
      
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
      
      if (data.length > 0) {
        setHeaders(data[0] as string[]) 
        const rawData = XLSX.utils.sheet_to_json(ws)
        setFileData(rawData)
        setStep(2) 
      }
    }
    
    reader.readAsArrayBuffer(file)
  }

  // FORMATADOR DE DATA NO PREVIEW
  const formatPreviewValue = (val: any) => {
      if (typeof val === 'number' && val > 40000 && val < 50000) {
          try {
             const date = new Date(Math.round((val - 25569)*86400*1000))
             return date.toLocaleDateString('pt-BR')
          } catch (e) { return val }
      }
      return val
  }

  const handleImport = async () => {
    if (!mapping.description || !mapping.amount || !mapping.dueDate) {
      toast.error("Vincule os campos obrigatórios (Descrição, Valor, Data).")
      return
    }

    try {
      const formattedData = fileData.map((row) => {
        // DATA
        let dateVal = row[mapping.dueDate]
        let finalDate = new Date()
        if (typeof dateVal === 'number') {
             finalDate = new Date(Math.round((dateVal - 25569)*86400*1000))
        } else if (typeof dateVal === 'string') {
             if (dateVal.includes('/')) {
                const [day, month, year] = dateVal.split('/')
                if(day && month && year && year.length === 4) {
                    finalDate = new Date(`${year}-${month}-${day}`)
                } else {
                    finalDate = new Date(dateVal)
                }
             } else {
                 finalDate = new Date(dateVal)
             }
        }

        // STATUS
        let finalStatus = "EM_ABERTO"
        if (mapping.status && row[mapping.status]) {
            const statusText = String(row[mapping.status]).toLowerCase()
            if (statusText.includes("pago") || statusText.includes("paid") || statusText.includes("ok")) {
                finalStatus = "PAGO"
            }
        }

        return {
          description: row[mapping.description] || "Sem descrição",
          amount: Number(row[mapping.amount]) || 0,
          dueDate: finalDate,
          category: row[mapping.category] || null,
          type: defaultType,
          status: finalStatus,
          recurrenceId: null
        }
      })

      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: formattedData }),
      })

      if (!res.ok) throw new Error()

      toast.success(`${formattedData.length} transações importadas!`)
      setOpen(false)
      setStep(1)
      setFileData([])
      setMapping({ description: "", amount: "", dueDate: "", category: "", status: "" })
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao importar. Verifique o console.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Upload className="h-4 w-4" />
          Importar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Transações</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
             <FileSpreadsheet className="h-12 w-12 text-slate-300 mb-4" />
             <p className="text-sm font-medium text-slate-700 mb-2">Arraste sua planilha ou clique para selecionar</p>
             <p className="text-xs text-slate-500 mb-6">Suporta arquivos .xlsx ou .csv</p>
             <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload} 
                className="block w-full max-w-xs text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-slate-900 file:text-white
                  hover:file:bg-slate-800 cursor-pointer"
             />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
             
             {/* 1. SELEÇÃO DE TIPO */}
             <div className="grid gap-2">
                <Label>Importar tudo como:</Label>
                <Select value={defaultType} onValueChange={setDefaultType}>
                    <SelectTrigger className="bg-slate-50 w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DESPESA_EMPRESA">Despesa Empresa</SelectItem>
                        <SelectItem value="RECEITA_EMPRESA">Receita Empresa</SelectItem>
                        <SelectItem value="DESPESA_SOCIO">Despesa Sócio</SelectItem>
                    </SelectContent>
                </Select>
             </div>

             {/* 2. PREVIEW DOS DADOS */}
             <div className="rounded-md border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                    Resumo do Arquivo (Primeiras 3 linhas)
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                {headers.map((h, i) => (
                                    <TableHead key={i} className="h-8 text-xs font-bold text-slate-700">{h}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fileData.slice(0, 3).map((row, i) => (
                                <TableRow key={i} className="hover:bg-slate-50">
                                    {headers.map((h, j) => (
                                        <TableCell key={j} className="py-2 text-xs text-slate-600 whitespace-nowrap">
                                            {formatPreviewValue(row[h])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
             </div>

             {/* 3. VÍNCULO DE COLUNAS */}
             <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">Vincule as colunas do seu arquivo:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DESCRIÇÃO */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Descrição *</Label>
                        <Select onValueChange={(v) => setMapping({...mapping, description: v})}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar coluna..." /></SelectTrigger>
                            <SelectContent>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* VALOR */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Valor *</Label>
                        <Select onValueChange={(v) => setMapping({...mapping, amount: v})}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar coluna..." /></SelectTrigger>
                            <SelectContent>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* DATA */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Data de Vencimento *</Label>
                        <Select onValueChange={(v) => setMapping({...mapping, dueDate: v})}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Selecionar coluna..." /></SelectTrigger>
                            <SelectContent>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CATEGORIA */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Categoria (Opcional)</Label>
                        <Select onValueChange={(v) => setMapping({...mapping, category: v})}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Ignorar" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ignore_field">-- Ignorar --</SelectItem>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* STATUS */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500 uppercase font-bold">Status (Opcional)</Label>
                        <Select onValueChange={(v) => setMapping({...mapping, status: v})}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Ignorar (Padrão: Em Aberto)" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ignore_field">-- Ignorar --</SelectItem>
                                {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-400">Se contiver &quot;Pago&quot;, será marcado como Pago.</p>
                    </div>
                </div>
             </div>
          </div>
        )}

        <DialogFooter>
            {step === 2 && (
                <Button onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                    <Save className="mr-2 h-4 w-4" />
                    Processar Importação
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}