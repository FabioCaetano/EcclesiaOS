# Fase 54: Bloqueios De Data E Sugestao De Substitutos

## Objetivo

Permitir que pessoas marquem indisponibilidade em datas/periodos e que o lider receba sugestao automatica de substitutos quando alguem recusa uma escala.

## Status

Concluida.

## Escopo

### Backend

- Tipo `PersonBlockOut` em `packages/shared`.
- Migration Prisma criando `PersonBlockOutRecord`.
- `blockOutRepository` (list, listForPerson, isPersonBlockedOn, create, remove).
- Endpoints:
  - `GET /block-outs` (autenticado; filtro `?personId=`)
  - `POST /block-outs` (pessoa para si, ou admin para qualquer um)
  - `DELETE /block-outs/:id` (dono ou admin)
  - `GET /serving-plans/:planId/substitutes/:assignmentId` (admin ou lider do groupId)
- Algoritmo de sugestao:
  - candidatos = membros da equipe do plano
  - exclui ja escalados no plano e bloqueados na data
  - ranking por contagem de atribuicoes nos ultimos 30 dias (asc)

### Frontend

- AccountPage: card "Indisponibilidade" com lista + form.
- ServingPage: alerta visual quando pessoa selecionada na posicao tem bloqueio na data.
- ServingPage: botao "Sugerir substituto" em atribuicoes recusadas; abre lista com 3-5 candidatos e botao "Escalar".

## Fora De Escopo

- Recorrencia de bloqueios.
- Bloquear save automatico (so alerta).
- Confirmacao do substituto antes de escalar.
- Calendario proprio de bloqueios.
- Notificacao push.

## Criterios De Aceite

- Pessoa cria bloqueio para si na AccountPage; admin cria para outros via API.
- Pessoa nao consegue criar bloqueio para outra pessoa via API (403).
- Listagem volta filtrada por `personId` quando informado.
- Form de escala mostra alerta visual quando seleciono pessoa bloqueada na data do plano.
- Atribuicao com status `declined` mostra botao "Sugerir substituto" que retorna ate 5 candidatos.
- Candidatos respeitam: equipe, sem bloqueio na data, nao ja escalado no plano.

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

> Matrix view de equipes (multi-week), provedor de email/SMS real, ou alguma outra prioridade?
