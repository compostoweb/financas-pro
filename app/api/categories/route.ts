import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Validar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar apenas categorias do usuário
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Validar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const json = await request.json()
    const category = await prisma.category.create({
      data: { 
        userId: session.user.id, // Novo: associar ao usuário
        name: json.name,
        color: json.color || "#64748b",
        budget: json.budget || 0,
        scope: json.scope || "BOTH" // <--- NOVO
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}