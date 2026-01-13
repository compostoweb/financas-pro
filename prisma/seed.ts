import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🏁 1. Iniciando Seed...')

  try {
    // Limpar dados antigos
    console.log('🗑️ 2. Limpando transações antigas...')
    await prisma.transaction.deleteMany()

    // Usar o usuário padrão
    const DEFAULT_USER_ID = 'default-user-001'

    console.log('🌱 3. Criando novos dados...')

    // 1. Criar Despesas da Empresa
    await prisma.transaction.createMany({
      data: [
        { 
          userId: DEFAULT_USER_ID,
          description: 'Servidor VPS', 
          amount: 150.00, 
          dueDate: new Date('2026-01-10T12:00:00Z'), 
          type: 'DESPESA_EMPRESA', 
          status: 'PAGO' 
        },
        { 
          userId: DEFAULT_USER_ID,
          description: 'Licença Software', 
          amount: 299.90, 
          dueDate: new Date('2026-01-15T12:00:00Z'), 
          type: 'DESPESA_EMPRESA', 
          status: 'EM_ABERTO' 
        },
        { 
          userId: DEFAULT_USER_ID,
          description: 'Marketing Google', 
          amount: 500.00, 
          dueDate: new Date('2026-01-20T12:00:00Z'), 
          type: 'DESPESA_EMPRESA', 
          status: 'EM_ABERTO' 
        },
      ]
    })

    // 2. Criar Receitas da Empresa
    await prisma.transaction.createMany({
      data: [
        { 
          userId: DEFAULT_USER_ID,
          description: 'Cliente A - Consultoria', 
          amount: 2500.00, 
          dueDate: new Date('2026-01-05T12:00:00Z'), 
          type: 'RECEITA_EMPRESA', 
          status: 'PAGO' 
        },
        { 
          userId: DEFAULT_USER_ID,
          description: 'Cliente B - Projeto Web', 
          amount: 4000.00, 
          dueDate: new Date('2026-01-25T12:00:00Z'), 
          type: 'RECEITA_EMPRESA', 
          status: 'EM_ABERTO' 
        },
      ]
    })

    // 3. Criar Despesas do Sócio (Adriano)
    // Total esperado na View: 350,00
    await prisma.transaction.createMany({
      data: [
        { 
          userId: DEFAULT_USER_ID,
          description: 'Uber Pessoal', 
          amount: 100.00, 
          dueDate: new Date('2026-01-12T12:00:00Z'), 
          type: 'DESPESA_SOCIO', 
          status: 'PAGO' 
        },
        { 
          userId: DEFAULT_USER_ID,
          description: 'Almoço Domingo', 
          amount: 50.00, 
          dueDate: new Date('2026-01-12T12:00:00Z'), 
          type: 'DESPESA_SOCIO', 
          status: 'PAGO' 
        },
        { 
          userId: DEFAULT_USER_ID,
          description: 'Farmácia', 
          amount: 200.00, 
          dueDate: new Date('2026-01-14T12:00:00Z'), 
          type: 'DESPESA_SOCIO', 
          status: 'EM_ABERTO' 
        },
      ]
    })

    console.log('✅ 4. Seed finalizado com sucesso! Dados inseridos.')

  } catch (e) {
    console.error('💥 ERRO DURANTE O SEED:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })