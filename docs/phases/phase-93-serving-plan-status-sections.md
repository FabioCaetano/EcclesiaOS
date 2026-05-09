# Fase 93 - Escalas Por Status No Detalhe

## Objetivo

Continuar o amadurecimento do Passo 5, deixando o detalhe de uma escala menos poluido e mais operacional para lideres e administradores.

## Entregue

- O detalhe do plano de escala agora exibe um resumo por status:
  - recusadas;
  - pendentes;
  - confirmadas.
- As pessoas escaladas passam a ser agrupadas por status dentro do plano selecionado.
- Recusas aparecem primeiro, pois normalmente exigem acao do lider.
- Pendentes aparecem em seguida, para acompanhamento de respostas.
- Confirmadas ficam separadas como contexto ja resolvido.
- Edicao, remocao, resposta, busca de substitutos e aplicacao de substituto continuam funcionando usando o indice original do escalado.

## Arquivos alterados

- `apps/web/src/ServingPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-93-serving-plan-status-sections.md`
- `docs/decisions/0093-serving-plan-status-sections.md`

## Validacao

- `npm run build:web`: passou.

## Observacoes

- Esta fase nao alterou backend.
- Esta fase nao criou migration.
- A ordenacao visual nao muda o contrato de dados salvo, apenas a forma como o plano e apresentado no frontend.
