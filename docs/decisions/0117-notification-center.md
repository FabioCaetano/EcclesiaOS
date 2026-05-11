# Decisao 0117: Centro De Notificacoes Interno

## Status

Aceita.

## Contexto

O sistema ja calcula notificacoes de escala (`ServingNotification`) mas elas so aparecem dentro da pagina Escalas. Para o operador acompanhar o dia-a-dia da igreja precisa abrir varias telas (Escalas, Calendario, Agenda) e procurar pendencias. Falta uma superficie unica de "tem coisa pra olhar".

Tres opcoes foram consideradas:

1. **Tabela persistente** (notifications no banco): segue padroes de SaaS, mas exige migration, tabela nova, evento publisher/subscriber, gerenciamento de "lido". Caro para o ganho.
2. **Push real (web push/email)**: precisa provedor pago e fluxo de subscription. Fora do escopo de uma fase pequena.
3. **Agregador derivado**: backend monta uma lista on-demand a partir dos dados existentes; frontend marca lidas via localStorage. Sem nova migration, sem subscriber, baixo custo. **Escolhido.**

## Decisao

- Novo endpoint `GET /notifications` retorna uma lista de `NotificationItem`, agregada a partir de:
  - **`serving_pending`** — atribuicoes da pessoa logada com `status === "pending"` em planos futuros (reaproveita `servingPlanRepository.listNotifications`).
  - **`serving_declined`** — atribuicoes recusadas em planos do grupo liderado pela pessoa (lider precisa saber para substituir).
  - **`event_upcoming`** — eventos nos proximos 7 dias onde a pessoa e operador (`operatorPersonIds`) ou lider responsavel (mesma logica da Fase 116).
  - **`registration_email_pending`** — inscricoes em `pending_email_confirmation` em eventos que admin/lider responsavel gerencia.
- Cada item tem `id` deterministico (`kind:entityId`) para casar com leitura em localStorage.
- Cada item carrega `link.module` (modulo de origem) e `link.entityId` para o frontend navegar diretamente.
- Sino no header (`AppLayout`) abre um painel dropdown com a lista, agrupada por tipo.
- "Lido" e guardado em `localStorage` como `ecclesiaos:notifications:lastReadAt:<userId>` (ISO). Badge mostra contagem de itens com `createdAt > lastReadAt`. Abrir o painel atualiza o timestamp.
- Sem persistencia no backend; sem migration; sem tabela nova.
- Tipos `NotificationKind` e `NotificationItem` em `@ecclesiaos/shared`.

## Consequencias

- Pessoas tem visibilidade unica das pendencias.
- Reaproveita modelos existentes, sem duplicacao de dados.
- Como leitura e por dispositivo (localStorage), se trocar de navegador a marca recomeca — aceitavel para a fase, dado que se trata de notificacao "ativa" (futuro).
- Tipos sao estaveis: kinds novos viram strings adicionais no enum, frontend ignora desconhecidos.

## Nao Objetivos

- Persistencia de lido por usuario no banco.
- Push real (web push, email, mobile).
- Categorias personalizadas pelo usuario.
- Filtros avancados/historico longo.
- Notificacao em tempo real (websocket).
- Acoes inline (aceitar/recusar escala direto no painel) — clica e leva pra view origem.
