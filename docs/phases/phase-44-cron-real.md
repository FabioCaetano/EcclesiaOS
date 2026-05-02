# Fase 44: Cron Real Com Ocorrencias Materializadas

## Objetivo

Transformar a expressao cron textual de eventos em ocorrencias reais materializadas no banco, integradas com agenda, calendario, inscricoes, check-in e presenca, com fim definido pela propria configuracao do evento.

## Status

Concluida.

## Escopo

- Migration Prisma adicionando `parentEventId` opcional auto-referenciando `ChurchEvent`.
- Modulo de expansao de cron no backend usando `cron-parser`.
- Geracao lazy: `GET /events` garante ocorrencias materializadas dentro da janela retornada.
- Geracao manual: `POST /events/:id/generate-occurrences` regenera ocorrencias futuras de um evento mestre.
- `recurrenceUntil` passa a controlar o fim da geracao; quando vazio, aplica teto de 12 meses a frente da data atual.
- Idempotencia por `(parentEventId, date, startTime)`: nao gera duplicado.
- Remocao do evento mestre remove ocorrencias filhas futuras sem inscricoes/check-in.
- Tela Agenda exibe campo de fim de recorrencia ja existente e permite acionar geracao manual.

## Fora De Escopo

- Cron job externo, scheduler de SO ou worker em background.
- Propagacao automatica de edicoes do mestre para ocorrencias ja criadas no passado.
- Geracao para `recurrence: "weekly"` ou `"monthly"` (continuam como estao).
- UI de visualizacao de "todas as ocorrencias por mestre" alem do que a Agenda ja faz por data.

## Criterios De Aceite

- Criar evento com `recurrence: "cron"`, `recurrenceRule: "0 19 * * 3"` (toda quarta as 19h) e `recurrenceUntil` em 90 dias gera as ocorrencias intermediarias.
- Listar `/events` apos criar o mestre retorna mestre + filhos materializados na janela.
- Chamar `POST /events/:id/generate-occurrences` em um mestre cron regenera ocorrencias futuras sem duplicar passadas.
- Remover mestre cron remove filhos futuros que nao tem inscricoes nem check-in.
- Editar campos basicos do mestre nao quebra ocorrencias passadas.

## Verificacao

```powershell
npm.cmd run build --workspace @ecclesiaos/shared
npm.cmd run db:generate
npm.cmd run typecheck
npm.cmd run db:migrate
npm.cmd run reset-dev-data
npm.cmd run db:verify
npm.cmd run test
npm.cmd run build
```

E chamadas reais:

```text
POST http://localhost:4000/events
GET  http://localhost:4000/events
POST http://localhost:4000/events/:id/generate-occurrences
```

## Proxima Pergunta

Depois desta fase, a proxima pergunta sera:

> Vamos avancar para nova arquitetura de Escalas (evento solicita equipes, lider escala, equipe confirma) ou para Mensagens em lote em Pessoas?
