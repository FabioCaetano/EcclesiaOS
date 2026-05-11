# Fase 117: Centro De Notificacoes Interno

## Objetivo

Oferecer uma superficie unica de pendencias para operadores: sino no header com badge e painel dropdown agregando alertas calculados a partir dos dados existentes.

## Status

Concluida.

## Escopo

### Shared

- `NotificationKind = "serving_pending" | "serving_declined" | "event_upcoming" | "registration_email_pending"`.
- `NotificationItem { id, kind, title, message, createdAt, link: { module, entityId? } }`.

### Backend

- `apps/api/src/notifications.ts`:
  - funcao `computeNotificationsFor(user, repos)` que monta a lista agregada.
- `apps/api/src/server.ts`:
  - novo endpoint `GET /notifications` autenticado, devolve `NotificationItem[]` ordenado por `createdAt` desc.

### Frontend

- `apps/web/src/NotificationCenter.tsx`:
  - botao com icone `Bell` + badge de nao-lidas;
  - dropdown com lista agrupada por kind;
  - clique em item navega para a view do modulo de origem;
  - localStorage `ecclesiaos:notifications:lastReadAt:<userId>` para marcar leitura no momento de abrir o painel.
- `apps/web/src/AppLayout.tsx`:
  - inserir o `NotificationCenter` no `app-header-actions`.
- `apps/web/src/api.ts`:
  - `loadNotifications(token)`.
- `apps/web/src/styles.css`:
  - novo bloco `.notification-center`, `.notification-bell`, `.notification-panel`, `.notification-item`, `.notification-group`.

### Tests

- `apps/api/src/http.test.ts`:
  - novo teste cobrindo endpoint vazio e endpoint com escala pendente.

## Fora De Escopo

- Persistencia de lido no banco.
- Push real (web push/email/mobile).
- Acoes inline no painel.
- Filtros/historico longo.
- WebSocket.

## Criterios De Aceite

- `GET /notifications` retorna 401 sem token.
- Pessoa com atribuicao pendente em plano futuro recebe um item `serving_pending`.
- Sino aparece no header e abre painel.
- Badge some apos abrir o painel.
- Clicar em item leva para a view do modulo correto.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build:web
```

Manual: logar como lider, criar plano com atribuicao pendente, ver sino com `1`, abrir painel, clicar no item, conferir navegacao para Escalas.

## Proxima Pergunta

Depois desta fase:

> Integracao WhatsApp em lote (depende de provedor/custo) ou upload de logo da igreja para personalizar tela?
