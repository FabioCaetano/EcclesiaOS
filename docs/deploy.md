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
RESEND_API_KEY=<opcional; chave da Resend>
EMAIL_FROM=<opcional; ex.: "Sua Igreja <noreply@suaigreja.com>">
WEB_BASE_URL=<opcional; URL publica do frontend, padrao http://localhost:5173>
```

`RESEND_API_KEY` e `EMAIL_FROM` sao opcionais. Quando ausentes:

- Mensagens em lote continua funcionando, mas o envio de email cai para `mailto:` no dispositivo do operador.
- `GET /system/email-status` responde `{ "configured": false }` e o frontend mostra um banner indicando o fallback.

Quando configurados:

- Resend envia os emails com o remetente definido em `EMAIL_FROM`.
- Em producao, o dominio do `EMAIL_FROM` precisa estar verificado no painel da Resend (DNS).
- Ate verificar, voce so consegue enviar para o email cadastrado na conta Resend (modo de teste).

`WEB_BASE_URL` define o link enviado nos emails de "esqueci minha senha". Em producao na Vercel, ajuste para `https://seu-frontend.vercel.app` (ou seu dominio proprio).

## Migration Em Producao

Para producao, usar:

```powershell
npm run db:migrate:deploy
```

Nao usar `npm run db:migrate` em producao, porque ele usa `prisma migrate dev`, que e comando de desenvolvimento.

## Comando De Build Da API

```bash
npm install --include=dev && npm run build:api && npm run db:migrate:deploy
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
npm install --include=dev && npm run build:web
```

Publicar:

```text
apps/web/dist
```

## Observacao Sobre Monorepo

O frontend depende dos tipos compilados de `packages/shared`. Por isso o script `build:web` primeiro compila `@ecclesiaos/shared` e depois compila `@ecclesiaos/web`.

A API tambem depende de `packages/shared`. Por isso o script `build:api` compila `@ecclesiaos/shared` antes de `@ecclesiaos/api`, e a API usa `tsc -b` para respeitar as referencias TypeScript do monorepo.

No `apps/api/tsconfig.json`, `@ecclesiaos/shared` aponta para `packages/shared/dist/index.d.ts` durante o build. Isso evita que o CI tente compilar a API contra o `src` do pacote compartilhado e gere erro `TS6305`.

Arquivos `*.tsbuildinfo` nao devem ser versionados. Se eles entrarem no Git, o CI pode considerar o pacote compartilhado atualizado e nao emitir `packages/shared/dist/index.d.ts`, causando `TS7016` no Render.

Se o provedor de hospedagem instalar apenas dependencias de producao, o TypeScript pode falhar com erros como:

```text
Could not find a declaration file for module 'react'
Output file 'packages/shared/dist/index.d.ts' has not been built
```

Para evitar isso, use `npm install --include=dev` no comando de build ou defina a variavel:

```text
NPM_CONFIG_PRODUCTION=false
```

## Cuidados

- Trocar senhas dos usuarios seed depois do primeiro deploy.
- Nao rodar `reset-dev-data` quando houver dados reais.
- Render Free pode dormir apos inatividade.
- Neon Free e adequado para testes e demonstracao, nao para operacao critica.
