"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

interface ExportButtonProps {
  data: any[]
  filename?: string
  className?: string
}

export function ExportButton({ data, filename = "transacoes", className }: ExportButtonProps) {
  
  const handleExport = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("Não há dados para exportar.")
        return
      }

      // 1. Preparar os dados (Formatar para ficar bonito no Excel)
      const formattedData = data.map(item => ({
        "Descrição": item.description,
        "Data": new Date(item.dueDate).toLocaleDateString('pt-BR'),
        "Valor": Number(item.amount),
        "Tipo": item.type,
        "Categoria": item.category || "Sem Categoria",
        "Status": item.status,
      }))

      // 2. Criar a Planilha
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(formattedData)

      // Ajustar largura das colunas (opcional, mas fica melhor)
      const wscols = [
        { wch: 30 }, // Descrição
        { wch: 12 }, // Data
        { wch: 12 }, // Valor
        { wch: 15 }, // Tipo
        { wch: 20 }, // Categoria
        { wch: 10 }, // Status
      ]
      ws['!cols'] = wscols

      XLSX.utils.book_append_sheet(wb, ws, "Dados")

      // 3. Baixar o arquivo
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`)
      
      toast.success("Exportação concluída!")
    } catch (error) {
      console.error(error)
      toast.error("Erro ao exportar dados")
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} className={className}>
      <Download className="h-4 w-4" />
      Exportar
    </Button>
  )
}