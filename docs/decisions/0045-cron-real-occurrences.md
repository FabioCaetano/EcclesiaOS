# Decisao 0045: Cron Real Com Ocorrencias Materializadas

## Status

Aceita.

## Contexto

Eventos ja aceitam `recurrence: "cron"` com `recurrenceRule` textual, mas a expressao fica registrada e nao gera ocorrencias na agenda. Quem cadastra o evento ainda nao ve as datas que serao geradas.

A igreja precisa que a expressao cron passe a produzir ocorrencias reais na agenda, com fim definido pela propria configuracao do evento (via campo de fim de recorrencia), em vez de uma janela rolante arbitraria do sistema.

## Decisao

Materializar ocorrencias reais como eventos filhos no banco. Cada ocorrencia gerada e um `ChurchEvent` proprio com `parentEventId` apontando para o evento mestre, herdando os mesmos campos de operacao (titulo, tipo, local, grupo, inscricoes, capacidade etc.) na hora da geracao.

Regras:

- Quando `recurrence === "cron"`, a expressao em `recurrenceRule` define o padrao das ocorrencias.
- O campo existente `recurrenceUntil` define a data limite de geracao. Se vazio, o sistema aplica um teto tecnico de 12 meses a frente da data atual para evitar geracao infinita.
- Geracao e idempotente: a mesma combinacao `(parentEventId, date, startTime)` nao gera ocorrencia duplicada.
- Geracao acontece em dois momentos:
  - lazy: ao listar eventos, o backend garante que ocorrencias dentro da janela visivel ja foram materializadas;
  - manual: endpoint admin `POST /events/:id/generate-occurrences` regenera ocorrencias futuras de um evento mestre.
- Ocorrencias materializadas sao eventos completos: aparecem na agenda, no calendario, podem receber check-in, inscricoes e presenca como qualquer outro evento.
- Editar o evento mestre nao reescreve ocorrencias passadas. Editar campos basicos do mestre propaga apenas para ocorrencias futuras nao iniciadas via regeneracao manual.
- Remover o evento mestre remove tambem as ocorrencias futuras nao iniciadas (sem inscricoes ou check-in).

A expressao cron e parseada com cron-parser, dependencia ja consolidada no ecossistema Node, sem build nativo.

## Consequencias

- Cada ocorrencia tem `id` proprio, integrando sem hacks com check-in, inscricoes, presenca, calendario.
- A agenda e o calendario passam a refletir a recorrencia real.
- Schema ganha duas colunas em `ChurchEvent`: `parentEventId` e `recurrenceRule` ja existem; precisa apenas de `parentEventId` (a `recurrenceRule` ja existe). Migration adiciona `parentEventId` opcional auto-referenciando o evento.
- Deletar mestre precisa cuidar de filhos para nao deixar registros orfaos.
- Teto tecnico de 12 meses evita expansao infinita quando a igreja esquece de definir um fim.
- Geracao manual permite ao admin forcar atualizacao apos editar o mestre.

## Nao Objetivos

- Nao trocar o modelo para "ocorrencias virtuais calculadas".
- Nao oferecer agendamento por cron job de SO; geracao acontece sob demanda (lazy + manual).
- Nao propagar automaticamente todas as edicoes do mestre para ocorrencias ja criadas.
- Nao gerar ocorrencias para outros tipos de recorrencia alem de `cron` nesta fase; `weekly` e `monthly` continuam como hoje.
