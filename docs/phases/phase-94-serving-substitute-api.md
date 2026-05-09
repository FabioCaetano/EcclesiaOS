# Fase 94 - Substituicao Dedicada Em Escalas

## Objetivo

Continuar o Passo 5 criando uma acao propria para aplicar substitutos em escalas, evitando depender do salvamento completo do plano para uma operacao pontual.

## Entregue

- Novo contrato compartilhado:
  - `ServingSubstituteApplyInput`;
  - `ServingSubstituteApplyResponse`.
- Nova rota de API:
  - `PATCH /serving-plans/:planId/assignments/:assignmentId/substitute`.
- Nova funcao no repositorio de escalas para aplicar substituto em uma atribuicao especifica.
- Validacoes da API:
  - pessoa substituta obrigatoria;
  - apenas admin ou lider da equipe pode aplicar;
  - substituto precisa pertencer a equipe;
  - substituto nao pode ja estar escalado no mesmo plano;
  - substituto precisa estar habilitado para a posicao quando o ministerio usa posicoes;
  - substituto nao pode estar indisponivel na data da escala.
- Auditoria ao aplicar substituto.
- Notificacao best-effort ao novo voluntario usando o fluxo existente de nova escala.
- Frontend passou a usar a rota dedicada no botao **Aplicar e salvar**.

## Arquivos alterados

- `packages/shared/src/index.ts`
- `apps/api/src/data/servingPlanRepository.ts`
- `apps/api/src/server.ts`
- `apps/api/src/http.test.ts`
- `apps/web/src/api.ts`
- `apps/web/src/ServingPage.tsx`
- `docs/phases/phase-94-serving-substitute-api.md`
- `docs/decisions/0094-serving-substitute-api.md`

## Validacao

- `npm run build:api`: passou.
- `npm test --workspace @ecclesiaos/api`: passou com 40 testes.
- `npm run build:web`: passou.

## Observacoes

- Nao houve migration.
- A auditoria usa o log existente.
- O envio de email e best-effort: se o provedor nao estiver configurado, a substituicao ainda e salva.
