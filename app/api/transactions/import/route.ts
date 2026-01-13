import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { transactions } = json

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    // Criação em massa (Muito mais rápido que loop)
    const result = await prisma.transaction.createMany({
      data: transactions
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Erro Import:", error)
    return NextResponse.json({ error: "Erro ao importar" }, { status: 500 })
  }
}