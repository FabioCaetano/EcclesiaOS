# Fase 48: Aplicar Sistema De Design Aos Modulos Operacionais

## Objetivo

Estender o redesign aprovado na Fase 47 (PageHeader, Card, EmptyState, icones lucide) aos modulos operacionais que a equipe da igreja usa no dia a dia: Check-in, Calendario e Escalas.

## Status

Concluida.

## Escopo

- CheckInPage: PageHeader com tabs Eventos / Kids / Administracao, cards para cada secao, EmptyState quando listas vazias, icones nos botoes (Plus, Printer, Camera, MessageSquare).
- CalendarPage: PageHeader com filtro de mes/semana, navegacao com setas (ChevronLeft/Right), EmptyState quando sem eventos no periodo, badges para tipo (evento vs reserva) ja existentes.
- ServingPage: PageHeader com botao novo plano (admin), Card por secao, EmptyState para lider sem planos, icones em botoes de acao (Check, X, Send).

## Fora De Escopo

- Calendario com edicao rapida ou drag-and-drop.
- Mudar logica/regras de check-in ou de escalas.
- Outras telas (Financeiro, Auditoria, Usuarios, Ambientes, Grupos, Presenca) — fase 49.

## Criterios De Aceite

- As tres telas usam `PageHeader` consistente com Inicio, Igreja, Pessoas, Agenda.
- Cards substituem `.panel` no layout principal.
- Listas vazias mostram `EmptyState` amigavel.
- Botoes de acao primarios trazem icone alinhado ao texto.
- Mobile continua funcional (drawer, formularios em coluna unica).

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Inspecao manual em desktop e mobile.

## Proxima Pergunta

Depois desta fase:

> Refinar Financeiro, Usuarios, Auditoria, Ambientes, Grupos e Presenca (Fase 49) ou priorizar uma feature nova?
