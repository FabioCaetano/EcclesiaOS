# Decisao 0116: Permissao De Evento Por Grupo/Ministerio Responsavel

## Status

Aceita.

## Contexto

Eventos hoje (Fase 27 em diante) so podem ser criados, atualizados ou removidos por admin. Lideres de ministerios reclamam que precisam pedir para um admin alterar horario, descricao ou lista de equipes mesmo em eventos que sao do proprio ministerio deles. Ao mesmo tempo, abrir o modulo Eventos inteiro para `leader` via `canManageModule("events")` seria escalada de permissao — qualquer lider poderia editar qualquer evento, inclusive de outro ministerio.

Os campos `ChurchEvent.groupId` (grupo principal) e `ChurchEvent.requestedTeamIds[]` (equipes solicitadas para escala) ja existem; `GroupProfile.leaderPersonId` define o lider de cada grupo. Da para derivar responsabilidade sem nova migration.

## Decisao

- Introduzir helper compartilhado `isUserResponsibleForEvent(user, event, groups)` e `canEditEvent(user, event, groups)` em `@ecclesiaos/shared`. A funcao retorna true se:
  - `user.role === "admin"`, ou
  - `user.personId` e o `leaderPersonId` do grupo cujo id e `event.groupId`, ou
  - `user.personId` e o `leaderPersonId` de qualquer grupo listado em `event.requestedTeamIds`.
- `canCreateEventAs(user, draftInput, groups)` permite criar quando o usuario e admin, ou quando o draft aponta para um grupo (em `groupId` ou `requestedTeamIds`) liderado por ele.
- `handleCreateEvent`: aceita admin ou lider responsavel pelo draft.
- `handleUpdateEvent`: aceita admin ou lider responsavel pelo evento atual; quando o ator nao e admin, o servidor sobrescreve `groupId` e `requestedTeamIds` com os valores existentes, impedindo escalada de permissao por mudanca de grupo.
- `handleDeleteEvent`: continua admin-only (destrutivo).
- Frontend `EventsPage` usa `canEditEvent` para liberar/bloquear o form e remove a barreira `user.role !== "admin"` da maioria dos controles. Botao Remover continua restrito a admin.
- Audit log preserva o ator real (admin ou lider).

Sem migration, sem novo campo, sem mudanca de contrato.

## Consequencias

- Lideres ganham autonomia operacional sem comprometer isolamento entre ministerios.
- Quem nao for admin nao consegue editar um evento que ele nao "carrega".
- Logica fica derivada e reproduzivel; nao precisa migrar dados antigos.
- Frontend e backend usam o mesmo helper, evitando divergencia.

## Nao Objetivos

- Permissao por pessoa individual independente de grupo.
- Hierarquia de delegado (lider auxiliar).
- Permissao por evento individual via lista de pessoas explicita.
- Atribuir permissao de exclusao a lider.
- Mexer em eventos publicos (registracao) — segue a permissao atual.
