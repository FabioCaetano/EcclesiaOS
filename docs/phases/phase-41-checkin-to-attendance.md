# Fase 41: Consolidar Check-in Em Presenca

## Objetivo

Transformar check-ins de pessoas por evento em registros de presenca consolidados, mantendo Check-in como fluxo operacional principal e Presenca como dado historico/relatorio.

## Status

Concluida.

## Escopo

- Adicionar sincronizacao automatica em `attendanceRepository`.
- Ao criar check-in de pessoa, atualizar a presenca do evento.
- Ao remover check-in de pessoa, recalcular a presenca do evento.
- Criar presenca do evento quando ainda nao existir.
- Atualizar `presentPersonIds` sem duplicidade.
- Usar data, grupo e tipo derivados do evento.
- Exibir resumo de presenca consolidada na tela Check-in.
- Cobrir o fluxo em teste HTTP.

## Fora De Escopo

- Consolidar check-in infantil como presenca geral.
- Reativar a aba Presenca no menu principal.
- Relatorios avancados de frequencia.
- Presenca por familia/casa.
- Edicao manual dentro da tela Check-in.

## Criterios De Aceite

- Check-in de pessoa cria/atualiza presenca do evento.
- Remocao de check-in recalcula a lista de presentes.
- Pessoas nao aparecem duplicadas na presenca consolidada.
- Tela Check-in mostra resumo consolidado por evento.
- Build e testes continuam passando.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 19 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao recomendada sera:

> Queremos envio de comprovantes/ingressos ou auditoria avancada?
