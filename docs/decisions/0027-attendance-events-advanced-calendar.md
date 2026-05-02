# Decisao 0027: Presenca Por Evento E Agenda Avancada Inicial

## Status

Aceita.

## Contexto

Agenda/Eventos ja existia como cadastro simples. O proximo passo escolhido foi ligar Presenca a Eventos e iniciar recursos avancados de agenda.

## Decisao

Adicionar vinculo opcional entre presenca e evento por `eventId`.

Tambem adicionar recorrencia simples aos eventos:

- nenhuma;
- semanal;
- mensal.

A interface passa a oferecer filtro mensal e resumo de eventos por dia.

## Consequencias

- `AttendanceRecord` ganhou `eventId`.
- `EventRecord` ganhou `recurrence` e `recurrenceUntil`.
- Presencas seed ficam vinculadas aos eventos seed.
- Agenda ganha filtros e resumos mensais.
- Ainda nao ha geracao automatica de ocorrencias recorrentes.

## Nao Objetivos

- Nao criar inscricoes formais.
- Nao criar calendario visual completo.
- Nao gerar ocorrencias automaticamente.
- Nao criar check-in separado de presenca.
