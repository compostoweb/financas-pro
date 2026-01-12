-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEITA_EMPRESA', 'DESPESA_EMPRESA', 'DESPESA_SOCIO');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('EM_ABERTO', 'PAGO', 'ATRASADO');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL DEFAULT 'EM_ABERTO',
    "type" "TransactionType" NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
