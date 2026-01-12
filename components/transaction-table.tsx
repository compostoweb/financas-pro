"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, AlertCircle, X } from "lucide-react"
import { CreateTransactionDialog } from "./create-transaction-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner" 

// --- NOVOS IMPORTS DO ALERT DIALOG ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TransactionTableProps {
  transactions: any[]
  loading: boolean
  onUpdate: () => void
}

export function TransactionTable({ transactions, loading, onUpdate }: TransactionTableProps) {
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // ESTADOS PARA CONTROLAR OS DIALOGS DE CONFIRMAÇÃO
  const [deleteId, setDeleteId] = useState<string | null>(null) // ID para deletar 1 item
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)   // Estado para o modal de deletar vários

  useEffect(() => {
    const fetchColors = async () => {
        try {
            const res = await fetch("/api/categories")
            const data = await res.json()
            const colorMap: Record<string, string> = {}
            if (Array.isArray(data)) {
                data.forEach((cat: any) => colorMap[cat.name] = cat.color)
            }
            setCategoryColors(colorMap)
        } catch (error) {
            console.error(error)
        }
    }
    fetchColors()
  }, [])

  useEffect(() => {
    setSelectedIds([])
  }, [transactions])

  const realTransactions = transactions.filter(t => !t.id?.startsWith('summary-adriano'))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(realTransactions.map(t => t.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  // --- FUNÇÃO 1: DELETAR VÁRIOS (Com Toast Bonito) ---
  const confirmBulkDelete = async () => {
    setIsBulkDeleting(false) // Fecha o modal
    
    // Cria uma "Promessa" visual (Carregando -> Sucesso/Erro)
    const promise = fetch('/api/transactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
    })

    toast.promise(promise, {
      loading: 'Excluindo itens selecionados...',
      success: () => {
        setSelectedIds([])
        onUpdate()
        return `${selectedIds.length} itens movidos para lixeira!`
      },
      error: 'Erro ao excluir itens.'
    })
  }

  // --- FUNÇÃO 2: DELETAR UM (Com Toast Bonito) ---
  const confirmSingleDelete = async () => {
    if (!deleteId) return
    const idToDelete = deleteId
    setDeleteId(null) // Fecha o modal

    const promise = fetch(`/api/transactions/${idToDelete}`, { method: 'DELETE' })

    toast.promise(promise, {
      loading: 'Excluindo transação...',
      success: () => {
        onUpdate()
        return 'Transação excluída com sucesso!'
      },
      error: 'Erro ao excluir transação.'
    })
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  
  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR')

  if (loading) return <div className="text-center p-10 text-slate-500 animate-pulse">Carregando dados...</div>
  
  if (!Array.isArray(transactions) || transactions.length === 0) return (
    <div className="flex flex-col items-center justify-center p-10 text-slate-400 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
        <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
        <p>Nenhuma transação encontrada</p>
    </div>
  )

  const allSelected = realTransactions.length > 0 && selectedIds.length === realTransactions.length
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < realTransactions.length

  return (
    <>
      <div className="space-y-4">
        
        {/* BARRA FLUTUANTE DE AÇÕES EM MASSA */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-5 fade-in duration-300">
             <div className="text-sm font-medium">
               <span className="bg-red-700 px-2 py-0.5 rounded-full mr-2 text-xs">{selectedIds.length}</span>
               selecionado(s)
             </div>
             <div className="h-4 w-px bg-slate-700" /> 
             <div className="flex items-center gap-2">
               {/* BOTÃO QUE ABRE O ALERT DIALOG DE MASSA */}
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="text-white hover:text-red-400 hover:bg-slate-800 h-8 px-3"
                 onClick={() => setIsBulkDeleting(true)}
               >
                 <Trash2 className="mr-2 h-4 w-4" />
                 Excluir Selecionados
               </Button>
               <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 rounded-full ml-2"
                  onClick={() => setSelectedIds([])}
               >
                  <X className="h-4 w-4" />
               </Button>
             </div>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-slate-50/80 border-b border-slate-100">
                <TableHead className="w-[50px] text-center">
                   <Checkbox 
                      checked={allSelected || (isIndeterminate ? "indeterminate" : false)}
                      onCheckedChange={handleSelectAll}
                      disabled={realTransactions.length === 0}
                      className={'border-b border-gray-400 group-hover:border-red-500'}
                   />
                </TableHead>
                <TableHead className="w-[35%] pl-2 font-semibold text-slate-600">Descrição</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Vencimento</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Categoria</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Valor</TableHead>
                <TableHead className="text-center font-semibold text-slate-600">Status</TableHead>
                <TableHead className="w-[100px] text-center font-semibold text-slate-600">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const isSummary = t.id?.startsWith('summary-adriano')
                const catColor = t.category ? categoryColors[t.category] : null
                const isSelected = selectedIds.includes(t.id)

                return (
                  <TableRow 
                      key={t.id || Math.random()} 
                      className={`
                          transition-colors border-b border-slate-80 last:border-0 group
                          ${isSelected ? 'bg-red-100 border-slate-100 hover:bg-blue-200' : 'hover:bg-gray-300'}
                      `}
                  >
                    <TableCell className="text-center">
                      {!isSummary ? (
                         <Checkbox 
                           checked={isSelected}
                           onCheckedChange={(checked) => handleSelectOne(t.id, checked as boolean)}
                           className={'border-b border-gray-400 group-hover:border-red-500'}
                         />
                      ) : (
                         <div className="w-4 h-4" />
                      )}
                    </TableCell>

                    <TableCell className="font-medium text-slate-700 pl-2 py-4">
                      <div className="flex items-center gap-2">
                        {t.description}
                        {isSummary && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                            AUTOMÁTICO
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center text-slate-500 text-sm">
                        {t.dueDate ? formatDate(t.dueDate) : '-'}
                    </TableCell>
                    
                    <TableCell className="text-center text-sm">
                        {t.category ? (
                            <span 
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border"
                                style={{ 
                                    backgroundColor: catColor ? `${catColor}26` : "#f1f5f9", 
                                    color: catColor || "#64748b",
                                    borderColor: catColor ? `${catColor}33` : "#e2e8f0"
                                }}
                            >
                                {catColor && (
                                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: catColor }}/>
                                )}
                                {t.category}
                            </span>
                        ) : (
                            <span className="text-slate-400">-</span>
                        )}
                    </TableCell>
                    
                    <TableCell className="text-right font-bold text-slate-700">
                        {formatCurrency(Number(t.amount) || 0)}
                    </TableCell>
                    
                    <TableCell className="text-center">
                      <Badge 
                        variant={t.status === 'PAGO' ? 'default' : 'secondary'} 
                        className={`
                          ${t.status === 'PAGO' 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200' 
                            : 'bg-red-50 text-red-700 hover:bg-red-50 border-red-100'} 
                          border shadow-none font-medium
                        `}
                      >
                        {t.status ? t.status.replace('_', ' ') : 'ND'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-center">
                      {!isSummary && (
                        <div className="flex items-center justify-center gap-2">
                            <CreateTransactionDialog 
                               onSuccess={onUpdate} 
                               transactionToEdit={t} 
                            />
                            
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setDeleteId(t.id)} // ABRE O DIALOG UNICO
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Excluir</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- DIALOG DE DELETAR UM ITEM --- */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. A transação será excluída permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSingleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- DIALOG DE DELETAR VÁRIOS --- */}
      <AlertDialog open={isBulkDeleting} onOpenChange={setIsBulkDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.length} itens?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedIds.length} transações de uma vez. Essa ação é irreversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
              Confirmar exclusão em massa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}