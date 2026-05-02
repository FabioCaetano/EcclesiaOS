# Publicacao Gratuita

Esta nota registra o caminho inicial de publicacao gratuita para testar o EcclesiaOS fora da maquina local.

## Estrategia Inicial

- Banco: Neon Free, PostgreSQL gerenciado.
- API: Render Free Web Service.
- Frontend: Vercel Hobby ou Render Static Site.

## Etapa 1: Neon

1. Criar conta ou entrar em `https://neon.com`.
2. Criar um novo projeto.
3. Escolher PostgreSQL.
4. Copiar a connection string do banco.
5. Guardar a connection string como `DATABASE_URL`.

Formato esperado:

```text
postgresql://usuario:senha@host/neondb?sslmode=require
```

## Variaveis Da API

No servico da API, configurar:

```text
NODE_ENV=production
ECCLESIAOS_DATA_PROVIDER=prisma
DATABASE_URL=<connection string do Neon>
AUTH_TOKEN_SECRET=<chave longa e secreta>
```

## Migration Em Producao

Para producao, usar:

```powershell
npm run db:migrate:deploy
```

Nao usar `npm run db:migrate` em producao, porque ele usa `prisma migrate dev`, que e comando de desenvolvimento.

## Comando De Build Da API

```bash
npm install && npm run build && npm run db:migrate:deploy
```

## Comando De Start Da API

```bash
node apps/api/dist/server.js
```

## Frontend

Configurar no frontend:

```text
VITE_API_BASE_URL=https://sua-api.onrender.com
```

Build:

```bash
npm install && npm run build:web
```

Publicar:

```text
apps/web/dist
```

## Cuidados

- Trocar senhas dos usuarios seed depois do primeiro deploy.
- Nao rodar `reset-dev-data` quando houver dados reais.
- Render Free pode dormir apos inatividade.
- Neon Free e adequado para testes e demonstracao, nao para operacao critica.
