# Fase 105 - Check-in Kids: Relatorio Por Culto

## Objetivo

Adicionar um primeiro relatorio operacional de Check-in Kids por culto dentro do Totem Kids, permitindo consulta, impressao e exportacao CSV.

## Entregue

- Totem Kids ganhou acoes:
  - **CSV**;
  - **Relatorio**.
- CSV exporta:
  - crianca;
  - responsavel;
  - telefone;
  - sala;
  - idade;
  - status;
  - horario de entrada;
  - horario de saida;
  - alertas.
- Totem Kids ganhou painel **Relatorio do culto** com:
  - presentes;
  - retiradas;
  - total;
  - alertas;
  - distribuicao por sala;
  - lista resumida de alertas importantes.
- Impressao de relatorio oculta elementos de operacao como scanner, etiquetas e botoes.

## Escopo intencional desta fase

Esta fase usa os dados ja carregados no frontend. Nao cria endpoint novo nem tabela de relatorio.

Ainda nao foi implementado nesta fase:

- historico consolidado em aba Relatorios;
- filtros entre cultos;
- PDF dedicado;
- envio automatico por email;
- relatorios de eventos nao infantis.

## Arquivos alterados

- `apps/web/src/KidsTotemPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-105-kids-checkin-reports.md`
- `docs/decisions/0105-kids-checkin-reports.md`
- `docs/decision-log.md`
- `docs/index.md`
- `docs/project-status.md`
- `docs/next-steps.md`
- `docs/roadmap.md`

## Validacao

- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

O ambiente atual nao permitiu execucao de comandos PowerShell no sandbox:

`CreateProcessAsUserW failed: 1920`

## Proxima fase recomendada

Retomar Visitante no Check-in Kids:

- cadastro rapido do responsavel visitante;
- crianca vinculada ao visitante;
- acesso limitado ao Check-in;
- geracao de QR e impressao no Totem.
