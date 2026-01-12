# Deploy no Easypanel - Variáveis de Ambiente Necessárias

## 📋 Configuração Obrigatória

Para que a aplicação funcione corretamente, você precisa configurar as seguintes variáveis de ambiente no Easypanel:

### 1. Variáveis do Banco de Dados

```bash
DATABASE_URL=postgresql://usuario:senha@host:5432/nome_do_banco?schema=public
```

**⚠️ IMPORTANTE - Caracteres Especiais na Senha:**

Se sua senha contém caracteres especiais, você DEVE fazer URL encoding:
- `#` → `%23`
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `&` → `%26`
- `%` → `%25`

**Exemplo com senha especial:**
```
# Senha: CW2026#admin
# Correto: CW2026%23admin
DATABASE_URL=postgresql://admincw:CW2026%23admin@host:5432/app_financas?schema=public
```

**Formato completo:**
```
postgresql://[usuario]:[senha_encoded]@[host]:[porta]/[database]?schema=public
```

**Exemplo:**
```
DATABASE_URL=postgresql://financas:minha_senha_segura@postgres:5432/financas_pro?schema=public
```

### 2. Variáveis do Node.js

```bash
NODE_ENV=production
```

### 3. Variáveis Opcionais (Recomendadas)

```bash
NEXTAUTH_SECRET=sua-chave-secreta-super-segura
NEXTAUTH_URL=https://seu-dominio.com
```

Para gerar o NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 🚀 Como Configurar no Easypanel

### Opção 1: Interface Web

1. Acesse seu projeto no Easypanel
2. Vá em **Settings** > **Environment Variables**
3. Adicione cada variável:
   - Nome: `DATABASE_URL`
   - Valor: `postgresql://...` (sua string de conexão)
4. Clique em **Save**
5. Rebuild o container

### Opção 2: Usando PostgreSQL do Easypanel

Se você usar o serviço PostgreSQL do próprio Easypanel:

1. Crie um serviço PostgreSQL no mesmo projeto
2. Use o formato interno de conexão:
   ```
   DATABASE_URL=postgresql://postgres:sua_senha@postgres-service-name:5432/financas_pro?schema=public
   ```
3. O Easypanel geralmente preenche automaticamente essas variáveis

## 🔍 Verificando a Configuração

Após configurar e fazer rebuild, verifique os logs do container:

```
✅ Deve aparecer: "Database URL configured: postgresql://usuario@***"
✅ Deve aparecer: "Running database migrations..."
❌ Se aparecer: "ERROR: DATABASE_URL environment variable is not set!"
   → Verifique se a variável foi configurada corretamente
```

## 🗄️ Estrutura do Banco de Dados

As migrations serão executadas automaticamente ao iniciar o container. Elas criarão:

- Tabela `Category` (categorias)
- Tabela `Transaction` (transações)
- View `FluxoCaixa` (fluxo de caixa agregado)
- Índices e constraints necessários

## 🆘 Troubleshooting

### Erro: "invalid port number in database URL"
- **Causa**: Caracteres especiais na senha não foram encoded
- **Solução**: 
  1. Identifique os caracteres especiais na senha (exemplo: `#`, `@`, `:`)
  2. Substitua por suas versões encoded (exemplo: `#` → `%23`)
  3. Exemplo: `senha#123` deve ser `senha%23123`

### Erro: "Environment variable not found: DATABASE_URL"
- **Causa**: Variável não configurada no Easypanel
- **Solução**: Configure a variável DATABASE_URL nas configurações do projeto

### Erro: "Can't reach database server"
- **Causa**: Banco de dados não está acessível
- **Solução**: 
  1. Verifique se o serviço PostgreSQL está rodando
  2. Confirme o hostname correto (use o nome do serviço interno)
  3. Verifique usuário/senha/porta

### Erro: "SSL connection required"
- **Causa**: Banco externo requer SSL
- **Solução**: Adicione `?sslmode=require` ao final da DATABASE_URL
  ```
  DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public&sslmode=require
  ```

## 📝 Exemplo Completo de Configuração

```bash
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=postgresql://financas:senha123@postgres:5432/financas_pro?schema=public

# Node.js (OBRIGATÓRIO)
NODE_ENV=production

# Autenticação (OPCIONAL mas recomendado)
NEXTAUTH_SECRET=gere-uma-chave-super-segura-aqui
NEXTAUTH_URL=https://financas.seudominio.com
```

## 🔗 Links Úteis

- [Documentação do Prisma sobre Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Documentação do Easypanel](https://easypanel.io/docs)
