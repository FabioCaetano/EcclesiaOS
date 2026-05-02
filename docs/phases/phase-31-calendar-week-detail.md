# Fase 31: Calendario Semanal E Detalhe Do Dia

## Objetivo

Aprofundar o Calendario da igreja com uma visao semanal, detalhe do dia selecionado e filtros melhores para consulta operacional.

## Status

Concluida.

## Escopo

- Adicionar alternancia de visao:
  - mensal;
  - semanal.
- Adicionar selecao de dia no calendario.
- Adicionar painel de detalhe do dia selecionado.
- Exibir horarios, titulos e detalhes de eventos/reservas no dia.
- Adicionar filtro por ambiente.
- Manter filtro por tipo:
  - tudo;
  - eventos;
  - reservas.
- Destacar visualmente o dia selecionado.
- Manter legenda de eventos, reservas e cancelamentos.
- Preservar permissao de leitura para admin, lider e membro.

## Fora De Escopo

- Edicao rapida.
- Criacao de evento/reserva pelo calendario.
- Drag and drop.
- Endpoint agregado.
- Exportacao iCal/Google Calendar.
- Recorrencia expandida automaticamente.

## Criterios De Aceite

- Usuario consegue alternar entre visao mensal e semanal.
- Usuario consegue selecionar um dia e ver os itens daquele dia.
- Filtro por ambiente afeta reservas exibidas.
- Admin, lider e membro conseguem abrir a tela sem depender de rotas administrativas.
- Build e typecheck continuam passando.

## Verificacao

Concluida:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Resultados:

- `typecheck`: concluido.
- `test`: 16 testes API passando.
- `build`: concluido.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos aprofundar inscricoes de eventos com lista de participantes, pagamento manual e ingresso?
