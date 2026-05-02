# Decisao 0030: Reservas De Ambientes

## Status

Aceita.

## Contexto

Depois de eventos, inscricoes e check-in, surgiu a necessidade de controlar ambientes compartilhados da igreja. O objetivo e saber quando salas, auditorio e outros espacos estao reservados, evitando conflito de horario.

## Decisao

Criar um modulo `Ambientes` separado da Agenda.

Ambientes representam espacos compartilhados. Reservas representam uso de um ambiente em uma data e intervalo de horario, com vinculo opcional a um evento.

## Consequencias

- A Agenda continua responsavel pelos eventos.
- Ambientes passam a ter CRUD proprio.
- Reservas passam a ter CRUD proprio.
- O calendario visual futuro podera combinar eventos e reservas sem misturar responsabilidades.
- A API bloqueia sobreposicao de horario no mesmo ambiente.
- Admin gerencia ambientes e reservas; usuarios autenticados podem visualizar.

## Nao Objetivos

- Nao criar calendario visual nesta fase.
- Nao criar reserva publica sem login.
- Nao criar aprovacao de solicitacoes.
- Nao criar recorrencia de reservas.
- Nao criar inventario de equipamentos ainda.
