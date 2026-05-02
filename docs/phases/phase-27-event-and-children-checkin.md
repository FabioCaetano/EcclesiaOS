# Fase 27: Check-in Por Evento E Ministerio Infantil

## Objetivo

Permitir registrar presenca operacional em eventos e check-in infantil para cultos recorrentes.

## Status

Concluida.

## Escopo

- Criar tipos:
  - `EventCheckIn`;
  - `EventCheckInInput`;
  - `ChildCheckIn`;
  - `ChildCheckInInput`.
- Criar migration `20260430230000_event_and_children_checkin`.
- Criar tabelas:
  - `EventCheckInRecord`;
  - `ChildCheckInRecord`.
- Adicionar check-ins ao provider JSON e Prisma.
- Criar `checkInRepository`.
- Criar endpoints:

```text
GET    /event-checkins
POST   /event-checkins
DELETE /event-checkins/:id
GET    /child-checkins
POST   /child-checkins
PATCH  /child-checkins/:id/checkout
```

- Criar tela `Check-in`.
- Permitir que `admin` e `leader` operem check-in.
- Registrar auditoria para check-in e saida infantil.

## Fora De Escopo

- Etiquetas impressas.
- Auto check-in publico.
- Cadastro permanente de criancas.
- Conversao automatica de check-in para presenca consolidada.

## Criterios De Aceite

- Lider consegue registrar check-in de pessoa em evento.
- Lider consegue registrar check-in infantil.
- Check-in infantil gera codigo de seguranca.
- Lider consegue registrar saida infantil.
- Membro nao consegue registrar check-in.
- Banco real possui as novas tabelas.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run db:migrate
npm.cmd run build
npm.cmd run reset-dev-data
npm.cmd run db:verify
```

Resultados:

- `typecheck`: concluido.
- `test`: 13 testes API passando.
- `db:migrate`: schema confirmado atualizado com 6 migrations.
- `build`: concluido.
- `reset-dev-data`: concluido.
- `db:verify`: `Event check-ins: 0` e `Child check-ins: 0`.

Observacao: o Prisma Migrate voltou a ficar preso em advisory lock durante a execucao, mas o lock foi limpo e `migrate status` confirmou que a migration foi aplicada.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos converter check-ins em presenca automaticamente, criar tela de auditoria, ou adicionar etiquetas para ministerio infantil?
