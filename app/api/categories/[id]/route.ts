import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

interface Context {
  params: Promise<{ id: string }>
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    // Validar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar se a categoria pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada ou não autorizado" }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    // Validar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar se a categoria pertence ao usuário
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada ou não autorizado" }, { status: 404 })
    }

    const json = await request.json()

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: json.name,
        color: json.color,
        budget: json.budget, // <--- ATUALIZA O ORÇAMENTO
      },
    })
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}