# Fase 104 - Check-in 2.0: Alertas Da Crianca

## Objetivo

Adicionar a primeira camada de dados sensiveis da crianca no fluxo de Check-in Kids, exibindo alertas importantes para a equipe no Totem e na etiqueta.

## Entregue

- `GuardianChildInput` ganhou campos:
  - `allergies`;
  - `medicalNotes`;
  - `pickupNotes`.
- Formulario **Adicionar crianca** ganhou campos:
  - Alergias;
  - Saude;
  - Retirada.
- Backend salva esses dados como notas estruturadas da pessoa:
  - `Alergias: ...`;
  - `Saude: ...`;
  - `Retirada: ...`.
- Check-in Kids exibe alertas da crianca na lista do responsavel.
- Totem Kids exibe alertas na lista operacional.
- Etiqueta individual e lote passam a imprimir os alertas quando existirem.

## Escopo intencional desta fase

Esta fase nao cria migration nova. Os alertas foram salvos em `PersonProfile.notes` com prefixos estruturados para evitar mexer no schema enquanto validamos a UX.

Ainda nao foi implementado nesta fase:

- colunas normalizadas para alergias/saude/retirada;
- multiplos autorizados estruturados;
- edicao desses campos pelo responsavel;
- foto da crianca;
- controle de aprovacao administrativa.

## Arquivos alterados

- `packages/shared/src/index.ts`
- `apps/api/src/server.ts`
- `apps/web/src/CheckInPage.tsx`
- `apps/web/src/KidsTotemPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-104-child-alerts.md`
- `docs/decisions/0104-child-alerts.md`
- `docs/decision-log.md`
- `docs/index.md`
- `docs/project-status.md`
- `docs/next-steps.md`
- `docs/roadmap.md`

## Validacao

- `npm run build:api`: pendente nesta execucao.
- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

O ambiente atual nao permitiu execucao de comandos PowerShell no sandbox:

`CreateProcessAsUserW failed: 1920`

## Proxima fase recomendada

Criar relatorios de Check-in Kids por culto:

- presentes;
- retiradas;
- criancas por sala;
- horarios de entrada/saida;
- alertas importantes por culto.
