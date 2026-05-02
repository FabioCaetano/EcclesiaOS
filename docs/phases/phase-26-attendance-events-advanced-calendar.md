# Fase 26: Presenca Por Evento E Agenda Avancada Inicial

## Objetivo

Conectar presenca a eventos da agenda e iniciar recursos avancados da agenda sem abrir um modulo grande de inscricoes.

## Status

Concluida.

## Escopo

- Adicionar `eventId` em presencas.
- Adicionar `recurrence` e `recurrenceUntil` em eventos.
- Criar migration `20260430220000_presence_events_and_recurrence`.
- Atualizar seeds de presenca para apontarem para eventos.
- Atualizar provider JSON e provider Prisma.
- Atualizar tela Presenca:
  - seletor de evento;
  - preenchimento automatico de data/tipo/grupo ao escolher evento;
  - resumo de presenca por evento;
  - lista de eventos sem presenca.
- Atualizar tela Agenda:
  - filtro mensal;
  - resumo por dia;
  - indicador de recorrencia;
  - campos de recorrencia.
- Atualizar `db:verify` para exibir presencas vinculadas a eventos.

## Fora De Escopo

- Inscricoes.
- Check-in publico.
- Geracao automatica de recorrencias.
- Calendario mensal visual completo.

## Criterios De Aceite

- Presenca pode ser vinculada a um evento.
- Evento escolhido preenche dados basicos da presenca.
- Agenda filtra por mes.
- Eventos podem marcar recorrencia simples.
- PostgreSQL possui campos novos.
- Seed local possui eventos e presencas vinculadas.

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
- `test`: 12 testes API passando.
- `db:migrate`: migration aplicada; `migrate status` confirmou schema atualizado.
- `build`: concluido.
- `reset-dev-data`: concluido.
- `db:verify`: `Events: 2` e `Attendance linked to events: 2`.

Observacao: um comando `db:migrate` estourou timeout no terminal, mas o Prisma confirmou em seguida que a migration foi aplicada e que o schema esta atualizado.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir para inscricoes/check-in, tela de auditoria, ou troca/reset de senha?
