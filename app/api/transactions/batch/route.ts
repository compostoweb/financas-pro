import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Validar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const json = await request.json()
    const { ids } = json

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Nenhum ID fornecido" }, { status: 400 })
    }

    // Deleta todas as transações cujos IDs estejam na lista enviada E pertençam ao usuário
    const result = await prisma.transaction.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id // FILTRO CRÍTICO: apenas dados do usuário
      }
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch (error) {
    console.error("Erro Batch Delete:", error)
    return NextResponse.json({ error: "Erro ao deletar itens" }, { status: 500 })
  }
}