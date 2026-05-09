# Fase 95 - Visao Mensal De Escalas

## Objetivo

Continuar o Passo 5 com uma visao mensal para lideres e administradores acompanharem a distribuicao da equipe, carga por voluntario e status das respostas.

## Entregue

- A antiga aba **Matriz** foi ajustada para **Mensal**.
- Filtro por equipe/ministerio.
- Filtro por mes.
- Indicadores do mes:
  - planos;
  - confirmadas;
  - pendentes;
  - recusadas.
- Coluna de carga por voluntario no mes.
- Grade por pessoa x plano do mes.
- Status de cada escala por voluntario.
- Celulas com escala agora abrem o plano correspondente na lista/detalhe.

## Arquivos alterados

- `apps/web/src/ServingPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-95-serving-monthly-leader-view.md`
- `docs/decisions/0095-serving-monthly-leader-view.md`

## Validacao

- `npm run build:web`: passou.

## Observacoes

- Esta fase foi apenas frontend.
- Nao houve nova API.
- Nao houve migration.
- A visao mensal usa os planos de escala ja carregados pelo frontend.
