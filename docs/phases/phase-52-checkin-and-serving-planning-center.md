# Fase 52: Check-in E Escalas Estilo Planning Center

## Objetivo

Trazer para Check-in e Escalas a "vibe" do Planning Center: avatares, status pills, busca proeminente e cards no lugar de listas densas. Sem replicar o produto deles, e sem mudar logica.

## Status

Concluida.

## Escopo

### Primitivos

- `Avatar` (circulo com iniciais).
- `StatusPill` (variantes semanticas).
- Estilos `.checkin-search`, `.checkin-card`, `.checkin-grid`, `.checkin-side`, `.plan-team`, `.plan-position`, `.position-card`.

### Check-in

- Search input por aba.
- Cards de check-in com avatar + nome + status pill + horario relativo.
- Sidebar "No momento" na aba Administracao kids.

### Escalas

- Plan view com header + lista de cards de posicao.
- Status pills por atribuicao.
- Botao "Adicionar pessoa" abre linha nova.
- Lider continua restrito a pessoas da propria equipe.

## Fora De Escopo

- Drag-and-drop, fotos, email/SMS, real-time, multi-week, block-out, plan items.
- Mudar regras ou endpoints.

## Criterios De Aceite

- Buscar por nome filtra a lista de check-ins.
- Status pills aparecem em todas as posicoes de escala e em todos os check-ins.
- Avatar com iniciais consistente com o pill do header.
- Sidebar "No momento" aparece em Administracao kids no desktop.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Inspecao manual em desktop e mobile.

## Proxima Pergunta

Depois desta fase:

> Mensagens em lote em Pessoas, fluxo "esqueci minha senha" por email, ou substituto automatico para escalas recusadas?
