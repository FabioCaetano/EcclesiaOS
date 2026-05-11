# Fase 116: Permissao De Evento Por Grupo/Ministerio Responsavel

## Objetivo

Liberar lideres de ministerio para criar e editar os eventos pelos quais sao responsaveis, sem expor a possibilidade de escalada para eventos de outros ministerios.

## Status

Concluida.

## Escopo

### Shared

- `packages/shared/src/index.ts`:
  - `isUserResponsibleForEvent(user, event, groups): boolean`;
  - `canEditEvent(user, event, groups): boolean` (admin sempre, lider responsavel tambem);
  - `canCreateEventDraft(user, draft, groups): boolean` (admin sempre, lider so quando o draft aponta para grupo que ele lidera).

### Backend

- `apps/api/src/server.ts`:
  - `handleCreateEvent`: troca `requireAdmin` por verificacao com `canCreateEventDraft`; lider sem grupo retorna 403.
  - `handleUpdateEvent`: troca `requireAdmin` por verificacao com `canEditEvent` no evento existente; quando o ator nao e admin, sobrescreve `groupId` e `requestedTeamIds` com os valores atuais (nao deixa o lider escalar permissao).
  - `handleDeleteEvent`: mantem admin-only.
  - `handleGenerateEventOccurrences`: mantem admin-only (mexe em massa).
  - Audit registra ator real.

### Frontend

- `apps/web/src/EventsPage.tsx`:
  - usar `canEditEvent` em vez de `user.role !== "admin"` no form principal;
  - controles de novo evento liberados quando o usuario tem ao menos um grupo liderado (ou e admin);
  - mensagem de rodape ajustada;
  - botao Remover e botao Gerar ocorrencias continuam restritos a admin.

### Tests

- `apps/api/src/http.test.ts`:
  - novo teste: lider responsavel pelo `groupId` cria evento; outro lider que nao lidera nada nao consegue;
  - lider edita evento mas tentativa de trocar `groupId` para grupo que ele nao lidera e silenciosamente revertida (campo final igual ao anterior);
  - lider nao consegue deletar.

## Fora De Escopo

- Permissao por pessoa individual.
- Hierarquia de delegado.
- Mudanca de permissao de eventos publicos.

## Criterios De Aceite

- Admin continua podendo tudo.
- Lider do grupo principal do evento consegue editar campos do evento.
- Lider de uma equipe solicitada consegue editar.
- Lider sem relacao com o evento recebe 403.
- Tentar trocar `groupId`/`requestedTeamIds` como lider mantem os valores originais.
- Excluir evento continua restrito a admin.

## Verificacao

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build:web
```

Manual: logar como lider de "Louvor", abrir um evento que tem `Louvor` em `requestedTeamIds`, editar horario, salvar; tentar trocar o grupo principal e ver o backend manter o original.

## Proxima Pergunta

Depois desta fase:

> Integracao real com WhatsApp em lote (precisa confirmar provedor e custo) ou centro de notificacoes interno?
