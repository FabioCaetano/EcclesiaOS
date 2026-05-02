# Fase 6: Grupos E Ministerios

## Objetivo

Criar o cadastro inicial de grupos, ministerios, classes e equipes.

## Status

Implementada.

## Escopo

- Contratos compartilhados de grupo.
- Persistencia local de grupos.
- Endpoint para listar grupos.
- Endpoint para criar grupo.
- Endpoint para atualizar grupo.
- Endpoint para remover grupo.
- Tela simples de grupos e membros.

## Fora De Escopo

- Presenca por grupo.
- Calendario do grupo.
- Comunicacao por email/mensagem.
- Permissoes por lider.
- Categorias avancadas.
- Familias/casas.

## Criterios De Aceite

- A API lista grupos. Concluido.
- Um admin consegue criar grupo. Concluido.
- Um admin consegue editar grupo. Concluido.
- Um admin consegue remover grupo. Concluido.
- Um admin consegue vincular membros ao grupo. Concluido.
- Lider e membro conseguem visualizar grupos. Concluido.
- Lider e membro nao conseguem alterar grupos. Concluido.

## Verificacao

- `npm.cmd run reset-dev-data`: concluido.
- `npm.cmd run typecheck`: concluido.
- `npm.cmd run build`: concluido.
- `GET /groups`: concluido.
- `POST /groups` com admin: concluido.
- `PUT /groups/:id` com admin: concluido.
- `DELETE /groups/:id` com admin: concluido.
- `GET /groups` com membro: concluido.
- `POST /groups` bloqueado para membro: concluido com `403`.

## Proxima Pergunta

Depois desta fase, a proxima decisao sera:

> Queremos seguir para Presenca ou aprofundar Grupos com calendario e comunicacao?
