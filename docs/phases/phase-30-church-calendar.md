# Fase 30: Calendario Visual Da Igreja

## Objetivo

Criar uma visao mensal consolidada da igreja, reunindo eventos da Agenda e reservas de ambientes em um unico calendario.

## Status

Concluida.

## Escopo

- Criar modulo `Calendario` na navegacao principal.
- Criar pagina `CalendarPage`.
- Reutilizar dados existentes da API:
  - `GET /events`;
  - `GET /event-registrations`;
  - `GET /resources`;
  - `GET /room-reservations`.
- Montar grade mensal com dias da semana.
- Exibir eventos e reservas por dia.
- Exibir legenda visual:
  - eventos da Agenda;
  - reservas de Ambientes;
  - reservas canceladas.
- Adicionar filtro por mes.
- Adicionar filtro por tipo:
  - tudo;
  - eventos;
  - reservas.
- Exibir indicadores:
  - itens no periodo;
  - eventos;
  - reservas;
  - dias ocupados.
- Exibir resumo dos proximos itens no mes.
- Permitir que usuarios autenticados visualizem o calendario.
- Evitar que lider/membro dependam da rota administrativa de inscricoes.

## Fora De Escopo

- Criar endpoint agregado de calendario.
- Drag and drop.
- Edicao direta dentro do calendario.
- Visao semanal.
- Visao diaria.
- Recorrencia expandida automaticamente.
- Exportacao iCal/Google Calendar.
- Filtros por ministerio/equipe.

## Criterios De Aceite

- Admin visualiza calendario com eventos, inscricoes agregadas e reservas.
- Lider e membro visualizam calendario sem erro de permissao.
- Eventos e reservas aparecem no mesmo mes.
- Reservas canceladas aparecem visualmente atenuadas.
- Filtro por tipo funciona.
- Calendario usa dados reais de Agenda e Ambientes.

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

> Queremos aprofundar o calendario com visao semanal/edicao rapida, ou aprofundar inscricoes com lista de participantes, pagamento manual e ingresso?
