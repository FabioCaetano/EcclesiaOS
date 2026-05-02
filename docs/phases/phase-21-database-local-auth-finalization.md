# Fase 21: Finalizar Banco Local E Usuarios De Teste

## Objetivo

Fechar a configuracao do banco real local para permitir testar a aplicacao com os usuarios semente pela interface.

## Status

Concluida.

## Escopo

- Criar `.env` local com `ECCLESIAOS_DATA_PROVIDER=prisma`.
- Criar `.env` no workspace da API para o Prisma CLI encontrar `DATABASE_URL`.
- Adicionar carregamento automatico de `.env` na API.
- Carregar `.env` nos scripts `resetDevData` e `verifyPrisma`.
- Fazer `db:verify` validar tambem as credenciais semente.
- Manter testes automatizados em modo JSON isolado.
- Popular PostgreSQL local com dados semente.
- Testar login real de admin, lider e membro.

## Fora De Escopo

- Remover JSON.
- Criar banco remoto.
- Criar tela de gestao de usuarios.
- Criar fluxo de troca ou recuperacao de senha.

## Criterios De Aceite

- Postgres local sobe via Docker Compose.
- Prisma migrate encontra o `DATABASE_URL`.
- Seed popula PostgreSQL via Prisma.
- `db:verify` confirma dados e credenciais.
- API autentica:
  - `admin@ecclesiaos.local` / `admin123`;
  - `lider@ecclesiaos.local` / `lider123`;
  - `membro@ecclesiaos.local` / `membro123`.
- Browser permite login com os tres perfis.

## Verificacao

Concluida:

```powershell
docker compose up -d postgres
npm.cmd run db:migrate
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:web
npm.cmd run build
```

Validacao HTTP real:

```text
admin@ecclesiaos.local => OK admin
lider@ecclesiaos.local => OK leader
membro@ecclesiaos.local => OK member
```

Validacao no browser:

- admin entrou no painel;
- lider entrou no painel;
- membro entrou no painel;
- lider/membro nao veem Financeiro na navegacao.

Validacao final:

- `typecheck`: concluido.
- `test`: 10 testes API passando.
- `test:web`: 2 smoke tests Playwright passando.
- `build`: concluido.
- varredura ASCII: sem ocorrencias.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos criar matriz completa de permissoes, auditoria, ou agenda/eventos?
