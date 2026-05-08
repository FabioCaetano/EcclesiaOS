# Correcao - Deadlock Prisma Em Escritas Concorrentes

Data: 2026-05-08

## Problema

Em producao, a API caiu ao salvar Liturgia/Checklist com erro PostgreSQL:

- `deadlock detected`
- codigo interno PostgreSQL `40P01`
- stack em `writePrismaData`

O erro apareceu durante `prisma.financialTransactionRecord.create()`, mas a chamada original era `serviceChecklistRepository.create`. Isso aconteceu porque a camada atual de persistencia Prisma ainda regrava o snapshot inteiro do `DataFile` dentro de uma transacao grande.

Quando duas escritas entram quase ao mesmo tempo, duas transacoes podem apagar/recriar tabelas em paralelo e travar uma a outra.

## Correcao Aplicada

- Escritas Prisma agora passam por uma fila em memoria no processo da API.
- `writeData` e `appendEventsAndServingPlans` serializam chamadas Prisma.
- `writePrismaData` e `appendPrismaEventsAndServingPlans` ganharam retry curto para deadlock `40P01`.

## Arquivos

- `apps/api/src/data/dataStore.ts`
- `apps/api/src/data/prismaStore.ts`

## Validacao

```powershell
npm run build:api
npm test --workspace @ecclesiaos/api
```

Resultado: build da API passou e 40 testes passaram.

## Observacao Tecnica

Esta correcao reduz o risco imediato em producao. A evolucao ideal futura e trocar os repositorios mais usados para escritas incrementais por entidade, evitando regravar o snapshot inteiro em cada alteracao.
