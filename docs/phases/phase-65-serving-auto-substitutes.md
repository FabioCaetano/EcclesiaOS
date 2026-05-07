# Fase 65 - Substituto Automatico Para Recusas Em Escala

## Objetivo

Reduzir o trabalho manual do lider quando alguem recusa uma escala, sugerindo automaticamente substitutos disponiveis da mesma equipe.

## Entregue

- `PATCH /serving-plans/:planId/assignments/:assignmentId/status` passa a retornar `substituteSuggestions` quando o status vira `declined`.
- Novo contrato `ServingAssignmentStatusResponse`.
- Logica de sugestao centralizada em `buildSubstituteSuggestions`.
- Sugestoes respeitam:
  - pessoas da mesma equipe;
  - pessoas ainda nao escaladas no plano;
  - pessoas sem bloqueio de data no dia da escala;
  - menor carga recente nos ultimos 30 dias.
- Email de notificacao ao lider inclui a lista de substitutos sugeridos quando Resend esta configurado.
- `substituteEmailSent` informa se o email foi enviado.
- Tela Escalas recebe e mostra automaticamente as sugestoes retornadas apos recusa.
- Teste HTTP cobrindo recusa com substituto disponivel e candidato bloqueado excluido.

## Regras

- O sistema sugere, mas nao substitui sozinho.
- A aplicacao do substituto continua sendo uma acao do lider/admin na tela Escalas.
- Pessoas com bloqueio na data da escala sao excluidas.
- Pessoas ja escaladas no plano sao excluidas.
- Pessoas com status `declined` em planos anteriores nao contam para carga recente.
- Se nao houver provedor de email, o fluxo continua funcionando com `substituteEmailSent: false`.

## Fora Do Escopo

- Convite por link direto ao substituto.
- Substituicao totalmente automatica sem aprovacao do lider.
- Aceite/recusa do substituto por email.
- Historico de tentativas de substituicao.
- SMS/WhatsApp automatico.

## Arquivos Alterados

- `packages/shared/src/index.ts`
- `apps/api/src/server.ts`
- `apps/api/src/http.test.ts`
- `apps/web/src/api.ts`
- `apps/web/src/ServingPage.tsx`
- `docs/index.md`
- `docs/project-status.md`
- `docs/development.md`
- `docs/decision-log.md`
- `docs/next-steps.md`
- `docs/product-vision.md`

## Proximo Caminho Recomendado

**Auditoria Avancada E Relatorios**.

O produto ja tem varios fluxos sensiveis e automacoes. Antes de novas camadas, vale melhorar rastreabilidade, filtros backend e relatorios/exportacoes.
