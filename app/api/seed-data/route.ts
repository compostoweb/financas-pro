import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TransactionType, TransactionStatus } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Criar categorias de exemplo
    const categories = await Promise.all([
      prisma.category.create({
        data: { name: 'Alimentação', userId, color: '#FF6B6B' },
      }).catch(() => 
        prisma.category.findFirst({ where: { name: 'Alimentação', userId } })
      ),
      prisma.category.create({
        data: { name: 'Transporte', userId, color: '#4ECDC4' },
      }).catch(() => 
        prisma.category.findFirst({ where: { name: 'Transporte', userId } })
      ),
      prisma.category.create({
        data: { name: 'Energia', userId, color: '#FFE66D' },
      }).catch(() => 
        prisma.category.findFirst({ where: { name: 'Energia', userId } })
      ),
      prisma.category.create({
        data: { name: 'Serviços', userId, color: '#A8E6CF' },
      }).catch(() => 
        prisma.category.findFirst({ where: { name: 'Serviços', userId } })
      ),
    ])

    // Criar transações de exemplo
    const transactions = [
      {
        description: 'Venda de Produtos',
        type: TransactionType.RECEITA_EMPRESA,
        status: TransactionStatus.PAGO,
        dueDate: new Date('2026-01-05'),
        amount: 5000,
        userId,
        categoryId: categories[0].id,
      },
      {
        description: 'Aluguel do Escritório',
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.PAGO,
        dueDate: new Date('2026-01-10'),
        amount: 1500,
        userId,
        categoryId: categories[1].id,
      },
      {
        description: 'Compra de Materiais',
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.PENDENTE,
        dueDate: new Date('2026-01-15'),
        amount: 800,
        userId,
        categoryId: categories[2].id,
      },
      {
        description: 'Salário do Funcionário',
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.PENDENTE,
        dueDate: new Date('2026-01-20'),
        amount: 3000,
        userId,
        categoryId: categories[3].id,
      },
      {
        description: 'Retirada Pessoal',
        type: TransactionType.DESPESA_SOCIO,
        status: TransactionStatus.PAGO,
        dueDate: new Date('2026-01-08'),
        amount: 2000,
        userId,
        categoryId: categories[0].id,
      },
    ]

    await Promise.all(
      transactions.map(tx =>
        prisma.transaction.create({ data: tx })
      )
    )

    return NextResponse.json({
      message: 'Dados de exemplo criados com sucesso',
      categories,
      transactions,
    })
  } catch (error) {
    console.error('Erro ao criar dados:', error)
    return NextResponse.json(
      { error: 'Erro ao criar dados de exemplo' },
      { status: 500 }
    )
  }
}
