# Fase 77 - Liturgia e Checklist do Culto

## Objetivo

Adicionar uma area para planejar e acompanhar a liturgia/checklist de cada culto ou evento, conectada a Agenda e ao fluxo de Musicas/Repertorio.

## Implementado

- Nova entidade `ServiceChecklist`.
- Itens ordenados da liturgia com:
  - titulo;
  - horario previsto;
  - responsavel;
  - notas;
  - status de concluido;
  - ordem.
- Vinculo opcional com culto/evento da Agenda.
- Aba propria `Liturgia` no menu de Operacao.
- Permissao:
  - membros visualizam;
  - lideres e administradores criam, editam e removem.
- API:
  - `GET /service-checklists`
  - `POST /service-checklists`
  - `PUT /service-checklists/:id`
  - `DELETE /service-checklists/:id`
- Persistencia JSON local e PostgreSQL/Prisma.
- Migracao Prisma `20260507170000_service_checklists`.
- Teste de API validando permissao e persistencia basica.

## Arquivos principais

- `packages/shared/src/index.ts`
- `apps/api/src/data/serviceChecklistRepository.ts`
- `apps/api/src/data/dataStore.ts`
- `apps/api/src/data/prismaStore.ts`
- `apps/api/src/server.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260507170000_service_checklists/migration.sql`
- `apps/api/src/http.test.ts`
- `apps/web/src/LiturgyPage.tsx`
- `apps/web/src/AppLayout.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/api.ts`
- `apps/web/src/styles.css`

## Validacao

Executado com sucesso:

```powershell
npm run db:generate
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado dos testes:

- 39 testes passaram.

## Proximos passos

- Exibir repertorio e liturgia diretamente dentro da aba Agenda.
- Melhorar edicao inline de itens da liturgia.
- Criar visualizacao de execucao do culto em modo operador.
- Iniciar Formularios customizados.
