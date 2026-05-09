# Fase 96 - Polimento Final De Escalas

## Objetivo

Fechar o Passo 5 com melhorias praticas na visao mensal e no fluxo de substituicao, deixando Escalas mais utilizavel para lideres.

## Entregue

- Alerta de pessoas com alta carga na visao mensal.
- Destaque visual na linha da pessoa quando a carga mensal passa do criterio atual.
- Exportacao CSV da escala mensal.
- Impressao da visao mensal.
- Feedback mais claro ao aplicar substituto:
  - substituto aplicado e notificado;
  - ou substituto aplicado sem envio de notificacao/email configurado.

## Arquivos alterados

- `apps/web/src/ServingPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-96-serving-monthly-polish.md`
- `docs/decisions/0096-serving-monthly-polish.md`

## Validacao

- `npm run build:web`: pendente nesta execucao.

## Bloqueio de validacao

A tentativa com permissao elevada foi bloqueada pelo limite do ambiente. A tentativa sem permissao elevada falhou com erro do sandbox do Windows:

`CreateProcessAsUserW failed: 1920`

## Observacoes

- Esta fase foi apenas frontend.
- Nao houve API nova.
- Nao houve migration.
