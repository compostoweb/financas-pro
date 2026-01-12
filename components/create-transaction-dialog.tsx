"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Pencil, Repeat, Layers } from "lucide-react" 
import { toast } from "sonner" // <--- IMPORTANTE

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
  description: z.string().min(1, "Descrição obrigatória"),
  amount: z.number().min(0.01, "Valor inválido"),
  dueDate: z.string().min(1, "Data obrigatória"),
  type: z.enum(["RECEITA_EMPRESA", "DESPESA_EMPRESA", "DESPESA_SOCIO"]),
  status: z.enum(["EM_ABERTO", "PAGO"]),
  category: z.string().optional(),
  
  isRecurring: z.boolean(),
  recurrenceCount: z.number().min(2).max(120).optional(),
  updateAll: z.boolean(),
})

interface Props {
  onSuccess: () => void
  defaultType?: "RECEITA_EMPRESA" | "DESPESA_EMPRESA" | "DESPESA_SOCIO"
  transactionToEdit?: any 
}

export function CreateTransactionDialog({ onSuccess, defaultType, transactionToEdit }: Props) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([]) 
  const isEditing = !!transactionToEdit
  const hasRecurrenceSeries = isEditing && !!transactionToEdit.recurrenceId

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      dueDate: new Date().toISOString().split('T')[0],
      type: defaultType || "DESPESA_EMPRESA",
      status: "EM_ABERTO",
      category: "",
      isRecurring: false,
      recurrenceCount: 2,
      updateAll: false,
    },
  })

  const isRecurring = form.watch("isRecurring")
  const updateAll = form.watch("updateAll")

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => toast.error("Erro ao carregar categorias"))
  }, [])

  useEffect(() => {
    if (transactionToEdit) {
      let dateStr = "";
      try {
          dateStr = new Date(transactionToEdit.dueDate).toISOString().split('T')[0];
      } catch (e) {
          dateStr = new Date().toISOString().split('T')[0];
      }

      form.reset({
        description: transactionToEdit.description,
        amount: Number(transactionToEdit.amount),
        dueDate: dateStr,
        type: transactionToEdit.type,
        status: transactionToEdit.status,
        category: transactionToEdit.category || "",
        isRecurring: false, 
        recurrenceCount: 2,
        updateAll: false,
      })
    }
  }, [transactionToEdit, form])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen && !isEditing) {
        form.reset({
            description: "",
            amount: 0,
            dueDate: new Date().toISOString().split('T')[0],
            type: defaultType || "DESPESA_EMPRESA",
            status: "EM_ABERTO",
            category: "",
            isRecurring: false,
            recurrenceCount: 2,
            updateAll: false,
        })
    }
    if (isOpen) {
        fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data))
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const url = isEditing 
        ? `/api/transactions/${transactionToEdit.id}` 
        : "/api/transactions" 

      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar");
      }

      // FEEDBACK VISUAL
      const successMessage = isEditing 
        ? "Transação atualizada com sucesso!" 
        : "Transação criada com sucesso!";
      
      toast.success(successMessage);

      setOpen(false)
      if (!isEditing) form.reset()
      onSuccess()
    } catch (error) {
      console.error(error)
      toast.error("Ocorreu um erro ao salvar a transação.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEditing ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                <Pencil className="h-4 w-4" />
            </Button>
        ) : (
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
            </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os detalhes do lançamento." : "Preencha os dados do novo lançamento."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Vencimento</FormLabel>
                        <FormControl>
                            <Input 
                                type="date" 
                                {...field} 
                                disabled={updateAll} 
                                className={updateAll ? "bg-slate-100 text-slate-400" : ""}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="RECEITA_EMPRESA">Receita Empresa</SelectItem>
                            <SelectItem value="DESPESA_EMPRESA">Despesa Empresa</SelectItem>
                            <SelectItem value="DESPESA_SOCIO">Despesa Sócio</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value=" ">- Sem Categoria -</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {hasRecurrenceSeries && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <FormField
                  control={form.control}
                  name="updateAll"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2 text-blue-900">
                           <Layers className="h-4 w-4 text-blue-600" />
                           Aplicar a todas as parcelas?
                        </FormLabel>
                        <FormDescription className="text-blue-700/70 text-xs">
                          Atualiza valor e categoria de toda a série. A data não será alterada.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {!isEditing && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                           <Repeat className="h-4 w-4 text-slate-500" />
                           Repetir mensalmente?
                        </FormLabel>
                        <FormDescription>
                          Cria parcelas futuras automaticamente
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                   <FormField
                     control={form.control}
                     name="recurrenceCount"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Quantas vezes (meses)?</FormLabel>
                         <FormControl>
                           <Input type="number" min={2} max={120} {...field} value={field.value ?? 2} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                )}
              </div>
            )}
            
             <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                            <SelectItem value="EM_ABERTO">Em Aberto</SelectItem>
                            <SelectItem value="PAGO">Pago</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

            <div className="flex justify-end pt-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto">
                    {isEditing ? (updateAll ? "Salvar em Todos" : "Salvar Alteração") : "Criar Transação"}
                </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}