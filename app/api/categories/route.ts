import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const category = await prisma.category.create({
      data: { 
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