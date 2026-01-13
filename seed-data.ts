// Script para popular dados de exemplo
// Execute: npx ts-node seed-data.ts

import { PrismaClient } from "@prisma/client";
import { TransactionType, TransactionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userId = "cm5fmgh1f0000h8rswv8g8p0k"; // ID do usuário Adriano (será substituído pelo real)

  // Primeiro, pegar o ID real do usuário Adriano
  const user = await prisma.user.findUnique({
    where: { email: "adriano@compostoweb.com.br" },
  });

  if (!user) {
    console.error("❌ Usuário não encontrado!");
    process.exit(1);
  }

  console.log(`✅ Usuário encontrado: ${user.name} (${user.id})`);

  // Limpar dados antigos
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Alimentação", userId: user.id, color: "#FF6B6B" },
    }),
    prisma.category.create({
      data: { name: "Transporte", userId: user.id, color: "#4ECDC4" },
    }),
    prisma.category.create({
      data: { name: "Energia", userId: user.id, color: "#FFE66D" },
    }),
    prisma.category.create({
      data: { name: "Serviços", userId: user.id, color: "#A8E6CF" },
    }),
  ]);

  console.log(`✅ ${categories.length} categorias criadas`);

  // Criar transações
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        description: "Venda de Produtos - Janeiro",
        type: TransactionType.RECEITA_EMPRESA,
        status: TransactionStatus.PAGO,
        dueDate: new Date("2026-01-05"),
        amount: 5000,
        userId: user.id,
        category: categories[0].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: "Aluguel do Escritório",
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.PAGO,
        dueDate: new Date("2026-01-10"),
        amount: 1500,
        userId: user.id,
        category: categories[1].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: "Compra de Materiais",
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.EM_ABERTO,
        dueDate: new Date("2026-01-15"),
        amount: 800,
        userId: user.id,
        category: categories[2].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: "Salário do Funcionário",
        type: TransactionType.DESPESA_EMPRESA,
        status: TransactionStatus.EM_ABERTO,
        dueDate: new Date("2026-01-20"),
        amount: 3000,
        userId: user.id,
        category: categories[3].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: "Retirada Pessoal - Sócio",
        type: TransactionType.DESPESA_SOCIO,
        status: TransactionStatus.PAGO,
        dueDate: new Date("2026-01-08"),
        amount: 2000,
        userId: user.id,
        category: categories[0].id,
      },
    }),
    prisma.transaction.create({
      data: {
        description: "Venda de Serviços",
        type: TransactionType.RECEITA_EMPRESA,
        status: TransactionStatus.EM_ABERTO,
        dueDate: new Date("2026-01-25"),
        amount: 3500,
        userId: user.id,
        category: categories[3].id,
      },
    }),
  ]);

  console.log(`✅ ${transactions.length} transações criadas`);
  console.log("\n📊 Resumo:");
  console.log(`   📁 Categorias: ${categories.length}`);
  console.log(`   💰 Transações: ${transactions.length}`);
  console.log("\n✨ Dados populados com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
