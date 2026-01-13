"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Pencil, Check, Search, Building2, User, DollarSign } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// PALETA DE CORES (30 opções)
const EXTENDED_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
  "#71717a", "#1e293b", "#78350f", "#854d0e", "#3f6212", "#14532d",
  "#064e3b", "#164e63", "#0c4a6e", "#1e3a8a", "#312e81", "#4c1d95"
]

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newBudget, setNewBudget] = useState("") 
  const [newScope, setNewScope] = useState("COMPANY") // Padrão Empresa
  const [selectedColor, setSelectedColor] = useState(EXTENDED_COLORS[17]) 
  const [editingCategory, setEditingCategory] = useState<any | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")
      const data = await res.json()
      setCategories(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setNewName("")
    setNewBudget("")
    setNewScope("COMPANY")
    setSelectedColor(EXTENDED_COLORS[17])
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category)
    setNewName(category.name)
    setNewBudget(category.budget && Number(category.budget) > 0 ? String(category.budget) : "")
    // Se vier do banco como BOTH (antigo), força COMPANY para editar
    setNewScope(category.scope === "BOTH" ? "COMPANY" : category.scope || "COMPANY")
    setSelectedColor(category.color)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!newName.trim()) {
        toast.error("O nome da categoria é obrigatório")
        return
    }

    const payload = {
        name: newName,
        color: selectedColor,
        budget: newBudget ? parseFloat(newBudget) : 0,
        scope: newScope
    }

    try {
        if (editingCategory) {
          await fetch(`/api/categories/${editingCategory.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          toast.success("Categoria atualizada!")
        } else {
          await fetch("/api/categories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
          toast.success("Categoria criada!")
        }
        
        setIsDialogOpen(false)
        fetchCategories()
    } catch (e) {
        toast.error("Erro ao salvar categoria")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza? Isso removerá a categoria dos lançamentos existentes.")) return
    try {
        await fetch(`/api/categories/${id}`, { method: "DELETE" })
        toast.success("Categoria excluída")
        fetchCategories()
    } catch (e) {
        toast.error("Erro ao excluir")
    }
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categorias</h1>
          <p className="text-sm text-slate-500">Gerencie tipos de despesas e orçamentos.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder="Buscar categoria..." 
                    className="pl-8 bg-slate-50 border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button onClick={handleOpenCreate} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Nova
            </Button>
        </div>
      </div>

      {/* TABELA */}
      <Card className="border-none shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto px-4">
            <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow>
                        <TableHead className="w-[60px] text-center">Cor</TableHead>
                        <TableHead className="font-bold text-slate-700">Nome da Categoria</TableHead>
                        <TableHead className="font-bold text-slate-700 w-[180px]">Uso (Escopo)</TableHead>
                        <TableHead className="font-bold text-slate-700 w-[200px]">Orçamento (Meta)</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 w-[120px]">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">Carregando...</TableCell></TableRow>
                    ) : filteredCategories.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">Nenhuma categoria encontrada.</TableCell></TableRow>
                    ) : (
                        filteredCategories.map((cat) => (
                            <TableRow key={cat.id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0">
                                <TableCell className="text-center">
                                    <div className="mx-auto h-6 w-6 rounded-full border shadow-sm" style={{ backgroundColor: cat.color }} />
                                </TableCell>
                                <TableCell className="font-medium text-slate-800">
                                    {cat.name}
                                </TableCell>
                                <TableCell>
                                    {/* Exibe Empresa ou Sócio. Se vier BOTH/Geral do legado, mostra um aviso neutro */}
                                    {cat.scope === 'PARTNER' ? (
                                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 gap-1.5 font-normal">
                                            <User className="h-3 w-3" /> Sócio
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 gap-1.5 font-normal">
                                            <Building2 className="h-3 w-3" /> Empresa
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-slate-600">
                                    {Number(cat.budget) > 0 ? (
                                        <div className="flex items-center gap-1.5 font-medium bg-slate-50 w-fit px-2 py-1 rounded text-sm">
                                            <DollarSign className="h-3 w-3 text-slate-400" />
                                            {formatCurrency(Number(cat.budget))}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs pl-2">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" 
                                            onClick={() => handleOpenEdit(cat)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" 
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </Card>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO (LARGURA AUMENTADA) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              <DialogDescription>
                Categorize seus lançamentos e defina metas de orçamento.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              
              <div className="grid grid-cols-2 gap-6">
                  {/* NOME (Ocupa as 2 colunas) */}
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="name" className="text-slate-700">Nome da Categoria</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Marketing, Aluguel..."
                      className="bg-slate-50"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  {/* ESCOPO (Apenas 2 opções) */}
                  <div className="grid gap-2">
                    <Label className="text-slate-700">Uso (Quem paga?)</Label>
                    <Select value={newScope} onValueChange={setNewScope}>
                        <SelectTrigger className="bg-slate-50"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="COMPANY">Empresa (PJ)</SelectItem>
                            <SelectItem value="PARTNER">Sócio (PF)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>

                   {/* ORÇAMENTO */}
                   <div className="grid gap-2">
                    <Label htmlFor="budget" className="text-slate-700">Orçamento Mensal</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            id="budget"
                            type="number"
                            placeholder="0,00"
                            className="pl-9 bg-slate-50"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                        />
                    </div>
                  </div>
              </div>

              {/* COR - SEM SCROLL BAR (Grid direto) */}
              <div className="grid gap-3">
                <Label className="text-slate-700">Cor de Identificação</Label>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div className="flex flex-wrap gap-3 justify-start">
                    {EXTENDED_COLORS.map((color) => (
                        <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`
                            w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-all border border-slate-200
                            ${selectedColor === color ? "ring-2 ring-slate-900 ring-offset-2 scale-110" : "hover:scale-110 hover:shadow-md"}
                        `}
                        style={{ backgroundColor: color }}
                        >
                        {selectedColor === color && (
                            <Check className="h-4 w-4 text-white drop-shadow-md" />
                        )}
                        </button>
                    ))}
                    </div>
                </div>
              </div>

            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="mr-2">Cancelar</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]">
                {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}