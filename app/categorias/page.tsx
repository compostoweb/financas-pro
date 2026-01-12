"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Tag, Check, Pencil } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, // <--- 1. IMPORTADO AQUI
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", 
  "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", 
  "#f43f5e", "#64748b"
]

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[9])
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
    setSelectedColor(PRESET_COLORS[9])
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category)
    setNewName(category.name)
    setSelectedColor(category.color)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!newName.trim()) return

    if (editingCategory) {
      await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName, color: selectedColor }),
      })
    } else {
      await fetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({ name: newName, color: selectedColor }),
      })
    }
    
    setNewName("")
    setSelectedColor(PRESET_COLORS[9])
    setEditingCategory(null)
    setIsDialogOpen(false)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return
    await fetch(`/api/categories/${id}`, { method: "DELETE" })
    fetchCategories()
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categorias</h1>
          <p className="text-sm text-slate-500">Gerencie as cores e nomes para suas transações</p>
        </div>

        <Button onClick={handleOpenCreate} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
           <Plus className="mr-2 h-4 w-4" />
           Nova Categoria
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
              {/* 2. ADICIONADO AQUI PARA CORRIGIR O AVISO */}
              <DialogDescription>
                Escolha um nome e uma cor para identificar seus lançamentos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Ex: Marketing..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="grid gap-3">
                <Label>Cor de Identificação</Label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`
                        w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                        ${selectedColor === color ? "border-slate-900 scale-110" : "border-transparent hover:scale-110"}
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

            <DialogFooter>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">
                {editingCategory ? "Salvar Alterações" : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center p-10 text-slate-500">Carregando...</div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Tag className="h-10 w-10 mb-3 opacity-20" />
          <p>Nenhuma categoria cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="group hover:shadow-md transition-shadow border-slate-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: cat.color + "20" }} 
                  >
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: cat.color }} 
                    />
                  </div>
                  
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]" title={cat.name}>
                    {cat.name}
                  </span>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}