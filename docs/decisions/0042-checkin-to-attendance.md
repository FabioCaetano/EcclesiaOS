# Decisao 0042: Consolidar Check-in Em Presenca

## Status

Aceita.

## Contexto

A aba Presenca foi ocultada porque o fluxo operacional migrou para Agenda e Check-in. Ainda assim, os dados de presenca continuam importantes para relatorios e historico.

## Decisao

Consolidar automaticamente check-ins de pessoas por evento em registros de presenca. O operador continua usando Check-in; o sistema atualiza `AttendanceRecord` em segundo plano.

## Consequencias

- Presenca volta a ter utilidade como base historica.
- Check-in permanece como experiencia operacional principal.
- Relatorios futuros podem usar `AttendanceRecord`.
- Check-in infantil ainda fica separado por seguranca e responsaveis.

## Nao Objetivos

- Nao reativar Presenca no menu principal.
- Nao consolidar ministerio infantil nesta fase.
- Nao criar relatorios avancados.
- Nao alterar banco ou migrations.
