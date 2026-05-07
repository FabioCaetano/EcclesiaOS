# Fase 75 - Relatorios 1: Pessoas

## Objetivo

Criar a primeira aba de relatorios do EcclesiaOS com foco em dados de pessoas, membros, visitantes, aniversariantes e ministerios/equipes.

## Implementado

- Nova aba `Relatorios` no menu lateral.
- Indicadores gerais de pessoas:
  - total de pessoas;
  - total de membros;
  - total de visitantes;
  - total de membros batizados.
- Relatorio de aniversariantes dos proximos 7 dias.
- Segmentacao de membros por genero:
  - mulheres;
  - homens;
  - nao informado.
- Segmentacao de membros por faixa:
  - kids;
  - adolescentes;
  - adultos;
  - sem data de nascimento.
- Resumo de ministerios e equipes com quantidade de pessoas vinculadas.
- Exportacao CSV dos dados de pessoas, incluindo ministerios vinculados.

## Arquivos principais

- `apps/web/src/ReportsPage.tsx`
- `apps/web/src/AppLayout.tsx`
- `apps/web/src/main.tsx`
- `apps/web/src/types.ts`
- `packages/shared/src/index.ts`

## Decisao tecnica

Esta primeira fase usa apenas dados ja disponiveis no frontend (`people` e `groups`) para entregar relatorios rapidamente, sem criar novas tabelas ou endpoints. Relatorios mais pesados ou historicos deverao migrar para endpoints especificos quando o volume de dados crescer.

## Validacao

Validacao automatizada pendente nesta sessao porque a execucao de comandos foi bloqueada pelo limite de uso da aprovacao automatica. Validar assim que possivel:

```powershell
npm run build:web
npm run build:api
npm test --workspace @ecclesiaos/api
```

## Proximos passos

- Adicionar filtros por status, genero, faixa etaria e ministerio.
- Criar relatorios financeiros e de check-in.
- Avaliar endpoints dedicados para relatorios quando houver maior volume de dados.
