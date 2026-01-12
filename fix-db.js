const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Tentando remover a View antiga...');
    
    // O comando CASCADE remove a view e qualquer coisa ligada a ela
    await prisma.$executeRawUnsafe('DROP VIEW IF EXISTS "UnifiedTransactions" CASCADE');
    
    console.log('✅ Sucesso! A View "UnifiedTransactions" foi removida.');
  } catch (e) {
    console.error('❌ Erro ao remover:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();