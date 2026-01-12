import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// LISTAR
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erro ao buscar categorias:", error)
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 })
  }
}

// CRIAR
export async function POST(request: Request) {
  try {
    const json = await request.json()
    
    // Agora recebemos 'color' também
    const category = await prisma.category.create({
      data: { 
        name: json.name,
        color: json.color || "#64748b" 
      }
    })
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar" }, { status: 500 })
  }
}