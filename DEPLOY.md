# 🚀 Deploy em Produção - Finanças Pro

## Requisitos
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 10GB espaço em disco

## 📋 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e ajuste as configurações:

```bash
cp .env.production .env
```

**IMPORTANTE:** Edite o `.env` e altere:
- `POSTGRES_PASSWORD` - Use uma senha forte
- `NEXTAUTH_SECRET` - Gere um segredo único: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Coloque o domínio/IP de produção

### 2. Habilitar Output Standalone no Next.js

Edite `next.config.ts` e adicione:

```typescript
const nextConfig = {
  output: 'standalone',
  // ... outras configurações
}
```

### 3. Build e Iniciar os Containers

```bash
# Build e iniciar em background
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Ver apenas logs da aplicação
docker-compose logs -f webapp
```

### 4. Verificar Status

```bash
# Verificar containers
docker-compose ps

# Verificar saúde do banco
docker-compose exec postgres pg_isready

# Acessar logs do banco
docker-compose logs postgres
```

### 5. Acessar a Aplicação

- **Aplicação:** http://localhost:3000
- **Via Nginx:** http://localhost (porta 80)

## 🔧 Comandos Úteis

### Migrations do Prisma

```bash
# Aplicar migrations
docker-compose exec webapp npx prisma migrate deploy

# Seed do banco (se necessário)
docker-compose exec webapp npx prisma db seed
```

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec postgres pg_dump -U financas financas_pro > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
cat backup.sql | docker-compose exec -T postgres psql -U financas financas_pro
```

### Gerenciamento de Containers

```bash
# Parar containers
docker-compose stop

# Iniciar containers
docker-compose start

# Reiniciar containers
docker-compose restart

# Remover containers (dados persistem)
docker-compose down

# Remover containers E volumes (APAGA BANCO!)
docker-compose down -v
```

### Logs e Debug

```bash
# Logs de todos os serviços
docker-compose logs

# Seguir logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100

# Entrar no container da aplicação
docker-compose exec webapp sh

# Entrar no PostgreSQL
docker-compose exec postgres psql -U financas -d financas_pro
```

## 🔒 SSL/HTTPS (Opcional)

### Usando Let's Encrypt com Certbot

1. **Gerar certificados:**

```bash
# Instalar certbot
sudo apt-get install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com.br
```

2. **Copiar certificados:**

```bash
mkdir -p ssl
sudo cp /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem ssl/key.pem
```

3. **Habilitar SSL no nginx.conf** (descomentar seção SSL)

4. **Reiniciar Nginx:**

```bash
docker-compose restart nginx
```

## 🚨 Troubleshooting

### Container não inicia

```bash
# Ver erros detalhados
docker-compose logs webapp

# Verificar recursos
docker stats
```

### Erro de conexão com banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec webapp npx prisma db push
```

### Aplicação lenta

```bash
# Ver uso de recursos
docker stats

# Aumentar recursos do Docker (Docker Desktop)
# Settings > Resources > Memory (mínimo 2GB)
```

## 📊 Monitoramento

### Health Checks

```bash
# Nginx health check
curl http://localhost/health

# PostgreSQL
docker-compose exec postgres pg_isready
```

### Performance

```bash
# Ver uso de recursos em tempo real
docker stats

# Espaço em disco dos volumes
docker system df -v
```

## 🔄 Atualização da Aplicação

```bash
# 1. Pull do código atualizado
git pull origin main

# 2. Rebuild e restart
docker-compose up -d --build

# 3. Aplicar novas migrations
docker-compose exec webapp npx prisma migrate deploy
```

## 🌐 Deploy em Servidor Cloud

### DigitalOcean / AWS / Azure

1. Instalar Docker e Docker Compose no servidor
2. Clonar o repositório
3. Configurar `.env` com dados de produção
4. Abrir portas no firewall (80, 443)
5. Executar `docker-compose up -d --build`
6. Configurar domínio apontando para o IP do servidor

### Variáveis de ambiente recomendadas para produção:

```bash
# Segurança
POSTGRES_PASSWORD=<senha-super-segura>
NEXTAUTH_SECRET=<secret-gerado>
NEXTAUTH_URL=https://seu-dominio.com.br

# Performance
NODE_ENV=production
```

## 📝 Backup Automático

Adicione ao crontab do servidor:

```bash
# Backup diário às 3h da manhã
0 3 * * * cd /caminho/projeto && docker-compose exec -T postgres pg_dump -U financas financas_pro | gzip > /backups/financas_$(date +\%Y\%m\%d).sql.gz
```

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Confirme que as portas não estão em uso: `netstat -tulpn | grep :3000`
3. Valide o arquivo .env
4. Teste a conexão com o banco manualmente
