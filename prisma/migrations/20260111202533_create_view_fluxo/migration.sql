-- Remove a view se ela já existir
DROP VIEW IF EXISTS "UnifiedTransactions";

CREATE VIEW "UnifiedTransactions" AS

-- PARTE 1: Contas REAIS da Empresa
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

-- PARTE 2: A Linha Mágica (Corrigida)
SELECT 
  -- ID gerado com base no início do mês truncado
  concat('summary-adriano-', to_char(date_trunc('month', "dueDate"), 'YYYY-MM')) as id,
  
  -- Descrição usando a mesma base de data
  concat('Retirada Sócio - Adriano (', to_char(date_trunc('month', "dueDate"), 'MM/YYYY'), ')') as description,
  
  -- Soma
  SUM(amount) as amount,
  
  -- Vencimento calculado com base no início do mês truncado
  (date_trunc('month', "dueDate") + interval '1 month' + interval '4 days')::timestamp as "dueDate",
  
  NULL::timestamp as "paymentDate",
  'EM_ABERTO'::"TransactionStatus" as status,
  'DESPESA_EMPRESA'::"TransactionType" as type,
  NULL as "attachmentUrl",
  NOW() as "createdAt"
  
FROM "Transaction"
WHERE type = 'DESPESA_SOCIO'
-- O SEGREDO: Agrupar apenas pela função de truncar mês. 
-- Todas as colunas acima usam "date_trunc('month', "dueDate")", então o Postgres fica feliz.
GROUP BY date_trunc('month', "dueDate");