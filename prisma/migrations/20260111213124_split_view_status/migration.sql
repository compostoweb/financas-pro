DROP VIEW IF EXISTS "UnifiedTransactions";

CREATE VIEW "UnifiedTransactions" AS

-- PARTE 1: Contas REAIS da Empresa (Não muda nada)
SELECT 
  id,
  description,
  amount,
  "dueDate",
  "paymentDate",
  status,
  type,
  "attachmentUrl",
  "createdAt"
FROM "Transaction"
WHERE type IN ('RECEITA_EMPRESA', 'DESPESA_EMPRESA')

UNION ALL

-- PARTE 2: Linhas Dinâmicas do Sócio (AGRUPADO POR STATUS)
SELECT 
  -- O ID agora precisa incluir o status para não dar erro de duplicidade
  -- Ex: summary-adriano-2026-01-PAGO
  concat('summary-adriano-', to_char(date_trunc('month', "dueDate"), 'YYYY-MM'), '-', status) as id,
  
  -- A Descrição muda para indicar o que é aquela linha
  -- Ex: Retirada Sócio - Adriano (01/2026) - EM_ABERTO
  concat('Retirada Sócio - Adriano (', to_char(date_trunc('month', "dueDate"), 'MM/YYYY'), ') - ', replace(status::text, '_', ' ')) as description,
  
  SUM(amount) as amount,
  
  -- Vencimento (Dia 5 do mês seguinte)
  (date_trunc('month', "dueDate") + interval '1 month' + interval '4 days')::timestamp as "dueDate",
  
  NULL::timestamp as "paymentDate",
  
  -- O Status é o próprio agrupador
  status,
  
  'DESPESA_EMPRESA'::"TransactionType" as type,
  NULL as "attachmentUrl",
  NOW() as "createdAt"
  
FROM "Transaction"
WHERE type = 'DESPESA_SOCIO'
-- O GRANDE TRUQUE: Agrupamos por Mês E por Status
GROUP BY date_trunc('month', "dueDate"), status;