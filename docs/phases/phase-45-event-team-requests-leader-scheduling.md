# Fase 45: Eventos Solicitam Equipes E Lider Escala A Propria

## Objetivo

Conectar Agenda e Escalas: o evento passa a indicar quais equipes servem, o backend cria/garante um plano por equipe vinculado ao evento, e o lider da equipe escala somente pessoas da propria equipe sem precisar do admin.

## Status

Concluida.

## Escopo

- `ChurchEvent.requestedTeamIds: string[]` aceitando apenas grupos `ministry`/`team`.
- `ServingPlan.eventId: string` opcional, vinculando plano ao evento.
- Migration Prisma adicionando `requestedTeamIds Json` em `EventRecord` e `eventId String` em `ServingPlanRepository`, com indice por `eventId`.
- Sincronizacao automatica de planos no `eventRepository` (create/update/remove e materializacao de cron).
- `servingPlanRepository.syncForEvent`, `listByEventOrGroup`, validacao de membro da equipe ao atribuir.
- Endpoint `GET /serving-plans?groupId=` com filtro.
- `PUT /serving-plans/:id` aceitando lider do `groupId` do plano.
- UI Agenda: multi-select de equipes solicitadas no formulario.
- UI Escalas: lider ve apenas planos da propria equipe; resumo de recusas exibido por plano.

## Fora De Escopo

- Substituto automatico para recusas.
- Mensagens externas (WhatsApp/email) a lideres.
- Funcoes/cargos como entidade propria.
- Permitir lider criar evento.

## Criterios De Aceite

- Criar evento com `requestedTeamIds = [grp_louvor, grp_recepcao]` cria automaticamente dois `ServingPlan` vinculados.
- Criar evento cron com mesmas equipes e materializar ocorrencias gera planos para cada filho.
- Desmarcar equipe sem atribuicoes remove o plano correspondente; com atribuicoes mantem.
- Remover o evento cascateia para os planos vinculados.
- Lider de uma equipe ve `GET /serving-plans?groupId=<sua-equipe>` retornando apenas planos relevantes.
- Lider edita atribuicoes do proprio plano com pessoas da equipe; outras pessoas geram 403.
- Admin continua editando qualquer plano com qualquer pessoa.
- Tela Escalas mostra contagem de recusas por plano.

## Verificacao

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate:deploy
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

## Proxima Pergunta

Depois desta fase:

> Vamos seguir para Mensagens em lote em Pessoas, Troca/Reset de senha, ou Check-in Kids avancado?
