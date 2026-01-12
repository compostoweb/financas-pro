import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { ids } = json

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Nenhum ID fornecido" }, { status: 400 })
    }

    // Deleta todas as transações cujos IDs estejam na lista enviada
    const result = await prisma.transaction.deleteMany({
      where: {
        id: { in: ids }
      }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Erro Batch Delete:", error)
    return NextResponse.json({ error: "Erro ao deletar itens" }, { status: 500 })
  }
}