import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

interface Context {
  params: Promise<{ id: string }>
}

// DELETE (Já existia)
export async function DELETE(request: Request, { params }: Context) {
  try {
    const { id } = await params
    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 })
  }
}

// PATCH (Novo: Para Editar)
export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params
    const json = await request.json()

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: json.name,
        color: json.color,
      },
    })
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}