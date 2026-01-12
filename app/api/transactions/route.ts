import { TransactionType, TransactionStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { addMonths } from 'date-fns'
import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/prisma'

// GET (Listagem) - Mantive a lógica inteligente do resumo do sócio
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const startDate = searchParams.get('startDate') // NOVO
  const endDate = searchParams.get('endDate')     // NOVO

  try {
    const whereCondition: any = {}
    
    // Filtro de Tipo
    if (type) whereCondition.type = type

    // Filtro de Data (NOVO)
    if (startDate && endDate) {
        whereCondition.dueDate = {
            gte: new Date(startDate), // Maior ou igual ao inicio
            lte: new Date(endDate)    // Menor ou igual ao fim
        }
    }
    
    // @ts-ignore
    let transactions = await prisma.transaction.findMany({
      where: whereCondition,
      orderBy: { dueDate: 'asc' },
    })

    // LÓGICA DO SÓCIO (Mantida igual, mas agora respeita as datas no filtro principal)
    if (type === 'DESPESA_EMPRESA') {
       // Para calcular o resumo do sócio corretamente, precisamos pegar as despesas dele 
       // TAMBÉM dentro do período filtrado, senão o resumo fica errado.
       const socioWhere: any = { type: 'DESPESA_SOCIO' }
       
       if (startDate && endDate) {
            socioWhere.dueDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
       }

       // @ts-ignore
       const socioExpenses = await prisma.transaction.findMany({ where: socioWhere })

       const summaryGroups: any = {}
       
       socioExpenses.forEach((t: any) => {
         const month = new Date(t.dueDate).toISOString().slice(0, 7)
         const status = t.status 
         const key = `${month}-${status}`
         
         if (!summaryGroups[key]) {
            summaryGroups[key] = {
              amount: 0,
              monthDisplay: `${month.split('-')[1]}/${month.split('-')[0]}`,
              dateReference: t.dueDate,
              status: status
            }
         }
         summaryGroups[key].amount += Number(t.amount)
       })

       const summaryRows = Object.keys(summaryGroups).map(key => {
         const group = summaryGroups[key]
         return {
            id: `summary-adriano-${key}`,
            description: `Retirada Sócio - Adriano (${group.monthDisplay}) - ${group.status.replace('_', ' ')}`,
            amount: group.amount,
            dueDate: group.dateReference,
            type: TransactionType.DESPESA_EMPRESA,
            status: group.status as TransactionStatus,
            category: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            recurrenceId: null,
            attachmentUrl: null,
            paymentDate: null,
         }
       })

       transactions = [...transactions, ...summaryRows]
       
       transactions.sort((a, b) => 
         new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
       )
    }

    const formatted = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Erro API GET:", error)
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}

// POST (Criar)
import { z } from "zod"
import { randomUUID } from "crypto" // Import para gerar o ID do grupo

const createTransactionSchema = z.object({
  description: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  dueDate: z.coerce.date(),
  type: z.enum(["RECEITA_EMPRESA", "DESPESA_EMPRESA", "DESPESA_SOCIO"]),
  status: z.enum(["EM_ABERTO", "PAGO"]).default("EM_ABERTO"),
  category: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceCount: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const body = createTransactionSchema.parse(json)

    // Se NÃO for recorrente
    if (!body.isRecurring) {
        // @ts-ignore
        const transaction = await prisma.transaction.create({
          data: {
            description: body.description,
            amount: body.amount,
            dueDate: body.dueDate,
            type: body.type,
            status: body.status,
            category: body.category || null,
            recurrenceId: null // Sem grupo
          },
        })
        return NextResponse.json(transaction, { status: 201 })
    } 
    
    // SE FOR RECORRENTE
    else {
        const count = body.recurrenceCount || 2;
        const transactionsToCreate = [];
        const seriesId = randomUUID(); // GERA UM ID ÚNICO PARA ESSE GRUPO

        for (let i = 0; i < count; i++) {
            const newDate = addMonths(body.dueDate, i);
            const descriptionWithInstallment = `${body.description} (${i + 1}/${count})`;
            const currentStatus = i === 0 ? body.status : "EM_ABERTO";

            transactionsToCreate.push({
                description: descriptionWithInstallment,
                amount: body.amount,
                dueDate: newDate,
                type: body.type,
                status: currentStatus,
                category: body.category || null,
                recurrenceId: seriesId // TODAS GANHAM O MESMO ID
            })
        }

        // @ts-ignore
        await prisma.transaction.createMany({
            data: transactionsToCreate
        })

        return NextResponse.json({ success: true }, { status: 201 })
    }

  } catch (error) {
    console.error("Erro API POST:", error)
    return NextResponse.json({ error: "Erro ao criar transação" }, { status: 400 })
  }
}