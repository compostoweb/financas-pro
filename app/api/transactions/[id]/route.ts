import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

interface Context {
  params: Promise<{ id: string }>
}

// DELETE
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id } = await params
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir registro" }, { status: 500 })
  }
}

// PATCH (Editar)
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params
    const json = await request.json()

    // 1. Verifica se vai atualizar TODOS da série
    const updateAll = json.updateAll === true;

    // Dados base para atualizar
    const dataToUpdate: any = {}
    if (json.description) dataToUpdate.description = json.description // Obs: Isso sobrescreve a numeração (1/12)
    if (json.category !== undefined) dataToUpdate.category = json.category
    if (json.type) dataToUpdate.type = json.type
    // Status geralmente não se atualiza em massa, mas se quiser pode deixar
    // if (json.status) dataToUpdate.status = json.status 

    if (json.amount !== undefined) {
      const amount = Number(json.amount)
      if (!isNaN(amount)) dataToUpdate.amount = amount
    }

    // Nota: NÃO atualizamos a Data (dueDate) em massa, senão todas as parcelas
    // ficariam para o mesmo dia (ex: 12 parcelas vencendo em Janeiro).
    // Se for edição individual, atualiza a data.
    if (!updateAll && json.dueDate) {
        dataToUpdate.dueDate = new Date(json.dueDate)
    }

    // --- LÓGICA DE ATUALIZAÇÃO ---

    // Primeiro buscamos a transação original para pegar o recurrenceId
    const currentTransaction = await prisma.transaction.findUnique({ where: { id } })
    
    if (!currentTransaction) {
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    let result;

    if (updateAll && currentTransaction.recurrenceId) {
        // ATUALIZAÇÃO EM MASSA (Pelo ID do Grupo)
        // Removemos descrição do updateAll para não perder a numeração (ex: 1/12) se o usuário não mudou o texto
        // Mas se ele mudou, infelizmente perde a numeração (complexidade extra para manter)
        
        result = await prisma.transaction.updateMany({
            where: { recurrenceId: currentTransaction.recurrenceId },
            data: dataToUpdate,
        })
    } else {
        // ATUALIZAÇÃO INDIVIDUAL
        result = await prisma.transaction.update({
            where: { id },
            data: dataToUpdate,
        })
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error("ERRO EDIT:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}