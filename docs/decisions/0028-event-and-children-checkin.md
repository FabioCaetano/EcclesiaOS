# Decisao 0028: Check-in Por Evento E Ministerio Infantil

## Status

Aceita.

## Contexto

Agenda e presenca ja estavam conectadas por evento. O proximo passo solicitado foi criar check-in por evento e um fluxo especifico para ministerio infantil em cultos recorrentes.

## Decisao

Criar um modulo `Check-in` com dois fluxos:

- check-in de pessoa em evento;
- check-in infantil vinculado a evento de culto.

O check-in infantil registra crianca, responsavel, telefone, codigo de seguranca, entrada e saida.

## Consequencias

- PostgreSQL ganhou `EventCheckInRecord` e `ChildCheckInRecord`.
- Admin e lider podem operar check-in.
- Membro pode visualizar, mas nao registrar.
- Check-ins geram auditoria.
- O fluxo infantil fica preparado para cultos recorrentes cadastrados na Agenda.

## Nao Objetivos

- Nao criar impressao de etiqueta.
- Nao criar app publico de auto check-in.
- Nao criar cadastro permanente de criancas nesta fase.
- Nao transformar automaticamente check-ins em presenca consolidada ainda.
