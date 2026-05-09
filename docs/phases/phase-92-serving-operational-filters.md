# Fase 92 - Escalas Operacionais 2

## Objetivo

Dar continuidade ao Passo 5 combinado, amadurecendo a aba **Escalas** para reduzir poluicao visual e deixar a acao do lider mais direta quando houver pendencias ou recusas.

## Entregue

- Lista de escalas com filtro operacional por status:
  - acoes pendentes;
  - todas;
  - pendentes;
  - recusadas;
  - confirmadas.
- Filtro por equipe/ministerio na lista de planos de escala.
- Para membros, o filtro de acoes pendentes prioriza escalas pendentes da propria pessoa.
- Para lider/admin, o filtro de acoes pendentes prioriza planos com pendencias ou recusas.
- Sugestoes de substituto agora possuem a acao **Aplicar e salvar**.
- A acao rapida troca a pessoa escalada pelo substituto sugerido, volta o status para pendente e salva o plano imediatamente.
- A acao antiga **Escalar** foi mantida como modo de rascunho para o lider revisar antes de salvar.

## Arquivos alterados

- `apps/web/src/ServingPage.tsx`
- `apps/web/src/styles.css`
- `docs/phases/phase-92-serving-operational-filters.md`
- `docs/decisions/0092-serving-operational-filters.md`

## Validacao

- `npm run build:web`: passou.

## Observacoes

- Esta fase nao criou nova migration.
- Esta fase nao criou novo endpoint de API.
- A aplicacao do substituto usa o fluxo existente de salvar plano de escala.
- O proximo passo natural em Escalas e criar uma acao de backend especifica para substituicao, com auditoria e notificacao opcional.
