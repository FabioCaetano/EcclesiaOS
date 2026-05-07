# Fase 79 - Formularios customizados

## Objetivo

Criar uma area para formularios configuraveis, com responsaveis, link publico e acompanhamento das respostas.

## Implementado

- Novo modulo `Formularios` no menu de Operacao.
- Criação e edição de formularios com:
  - titulo;
  - descrição;
  - slug publico;
  - responsaveis;
  - status ativo/inativo;
  - campos ordenados.
- Tipos de campo:
  - texto curto;
  - texto longo;
  - email;
  - telefone;
  - numero;
  - data;
  - lista;
  - confirmação.
- Link publico `/forms/:slug` para envio de respostas.
- Listagem interna de respostas por formulario.
- Permissao:
  - lideres e administradores gerenciam;
  - publico responde pelo link;
  - membros nao gerenciam.
- Persistencia JSON local e PostgreSQL/Prisma.
- Migracao Prisma `20260507180000_custom_forms`.
- Teste de API cobrindo gestão por lider e resposta publica.

## Arquivos principais

- `packages/shared/src/index.ts`
- `apps/api/src/data/customFormRepository.ts`
- `apps/api/src/data/dataStore.ts`
- `apps/api/src/data/prismaStore.ts`
- `apps/api/src/server.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260507180000_custom_forms/migration.sql`
- `apps/api/src/http.test.ts`
- `apps/web/src/FormsPage.tsx`
- `apps/web/src/PublicCustomFormPage.tsx`
- `apps/web/src/AppLayout.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/api.ts`

## Validacao

Executado com sucesso:

```powershell
npm run db:generate
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado dos testes:

- 40 testes passaram.

## Proximos passos

- Enviar email/notificacao aos responsaveis quando houver nova resposta.
- Exportar respostas em CSV.
- Adicionar filtros e relatorios por formulario.
- Permitir campos condicionais e anexos.
