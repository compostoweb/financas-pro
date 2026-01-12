import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// LISTAR
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  return NextResponse.json(categories)
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